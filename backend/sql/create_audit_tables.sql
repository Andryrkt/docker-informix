-- ============================================================
-- Système d'historisation HFF Intranet
-- Base : SQL Server (HFF_INTRANET_TEST_01)
-- ============================================================

-- ── Table 1 : Historique de navigation ───────────────────────────────────────
-- Enregistre chaque passage dans une page, recherche effectuée,
-- action tentée/annulée, redirection vers une page d'erreur.
-- ─────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'audit_navigation' AND type = 'U')
BEGIN
    CREATE TABLE audit_navigation (
        id               INT            IDENTITY(1,1) NOT NULL,
        user_id          INT            NULL,
        username         NVARCHAR(100)  NULL,
        company_id       INT            NULL,
        company_code     NVARCHAR(50)   NULL,
        session_id       NVARCHAR(255)  NULL,

        -- Page visitée (URL côté SPA, ex: /atelier/demande-intervention/dit-list)
        page_url         NVARCHAR(500)  NOT NULL,
        page_title       NVARCHAR(255)  NULL,

        -- Action tentée : DELETE, SEARCH, VIEW, SUBMIT, VALIDATE, CANCEL, …
        action_attempted NVARCHAR(100)  NULL,

        -- Résultat : VISITED | SEARCHED | ATTEMPTED | CANCELLED | ERROR_REDIRECT
        action_result    NVARCHAR(50)   NULL,

        -- Paramètres de recherche (JSON) — ex: {"numero":"DIT-2025-0001","statut":"EN_COURS"}
        search_data      NVARCHAR(MAX)  NULL,

        -- Redirection erreur
        error_code       INT            NULL,
        error_message    NVARCHAR(MAX)  NULL,

        -- Contexte réseau
        ip_address       NVARCHAR(45)   NULL,
        user_agent       NVARCHAR(500)  NULL,
        referer_url      NVARCHAR(500)  NULL,

        created_at       DATETIME       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_audit_navigation PRIMARY KEY (id)
    );

    CREATE INDEX idx_audit_nav_user    ON audit_navigation (user_id);
    CREATE INDEX idx_audit_nav_date    ON audit_navigation (created_at);
    CREATE INDEX idx_audit_nav_result  ON audit_navigation (action_result);
    CREATE INDEX idx_audit_nav_company ON audit_navigation (company_id);

    PRINT 'Table audit_navigation créée.';
END
ELSE
    PRINT 'Table audit_navigation déjà existante — ignorée.';
GO


-- ── Table 2 : Historique des opérations métier ───────────────────────────────
-- Enregistre le résultat de chaque opération : soumission, validation,
-- suppression, upload de fichier, copie DocuWare, fusion, …
-- ─────────────────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'audit_operation' AND type = 'U')
BEGIN
    CREATE TABLE audit_operation (
        id               INT            IDENTITY(1,1) NOT NULL,
        user_id          INT            NULL,
        username         NVARCHAR(100)  NULL,
        company_id       INT            NULL,
        company_code     NVARCHAR(50)   NULL,

        -- Type d'opération (voir constantes AuditOperation::OP_*)
        -- SOUMISSION | VALIDATION | MODIFICATION | SUPPRESSION | CREATION
        -- CLOTUR | FILE_MERGE | DB_SAV | DW_COP | FILE_UPLOAD | ANNULATION
        operation_type   NVARCHAR(50)   NOT NULL,

        -- Type de document concerné (voir constantes AuditOperation::DOC_*)
        -- DIT | OR | FAC | RI | TIK | DA | DOM | BDM | CAS | CDE
        -- DEV | BC | AC | CDEFRN | SW | MUT
        document_type    NVARCHAR(20)   NULL,

        -- Identifiant technique du document (PK en base)
        document_id      NVARCHAR(100)  NULL,

        -- Numéro lisible du document (ex: DIT-2025-0001)
        document_number  NVARCHAR(100)  NULL,

        -- Résultat de l'opération
        is_success       BIT            NOT NULL DEFAULT 0,
        success_message  NVARCHAR(MAX)  NULL,
        error_message    NVARCHAR(MAX)  NULL,

        -- Code d'erreur métier (ex: MISSING_OR_NUMBER, DUPLICATE_ENTRY, …)
        error_code       NVARCHAR(100)  NULL,

        -- Données du formulaire soumis en JSON (champs sensibles expurgés)
        submitted_data   NVARCHAR(MAX)  NULL,

        -- Contraintes métier violées : [{"field":"numeroOR","message":"Le numéro OR est obligatoire"}]
        constraints_violated NVARCHAR(MAX) NULL,

        -- Opérations fichier détaillées :
        -- [{"type":"FILE_UPLOAD","fileName":"facture.pdf","path":"/docs/fac/","success":true}]
        file_operations  NVARCHAR(MAX)  NULL,

        -- Page SPA ayant déclenché l'opération
        page_url         NVARCHAR(500)  NULL,

        -- Durée de l'opération en ms (pour détecter les lenteurs)
        duration_ms      INT            NULL,

        ip_address       NVARCHAR(45)   NULL,
        created_at       DATETIME       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_audit_operation PRIMARY KEY (id)
    );

    CREATE INDEX idx_audit_op_user    ON audit_operation (user_id);
    CREATE INDEX idx_audit_op_date    ON audit_operation (created_at);
    CREATE INDEX idx_audit_op_type    ON audit_operation (operation_type);
    CREATE INDEX idx_audit_op_doctype ON audit_operation (document_type);
    CREATE INDEX idx_audit_op_success ON audit_operation (is_success);
    CREATE INDEX idx_audit_op_company ON audit_operation (company_id);
    CREATE INDEX idx_audit_op_doc     ON audit_operation (document_type, document_id);

    PRINT 'Table audit_operation créée.';
END
ELSE
    PRINT 'Table audit_operation déjà existante — ignorée.';
GO


-- ── Vue pratique : dernières opérations échouées ─────────────────────────────
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_audit_failures')
    DROP VIEW v_audit_failures;
GO

CREATE VIEW v_audit_failures AS
SELECT
    o.id,
    o.created_at,
    o.username,
    o.company_code,
    o.operation_type,
    o.document_type,
    o.document_number,
    o.error_code,
    o.error_message,
    o.constraints_violated,
    o.page_url
FROM audit_operation o
WHERE o.is_success = 0;
GO

PRINT 'Vue v_audit_failures créée.';
GO


-- ── Vue pratique : activité par utilisateur (dernières 24h) ──────────────────
IF EXISTS (SELECT * FROM sys.views WHERE name = 'v_audit_user_activity_24h')
    DROP VIEW v_audit_user_activity_24h;
GO

CREATE VIEW v_audit_user_activity_24h AS
SELECT
    n.username,
    n.company_code,
    COUNT(*)                                    AS nb_pages_visitees,
    SUM(CASE WHEN n.action_result = 'SEARCHED'       THEN 1 ELSE 0 END) AS nb_recherches,
    SUM(CASE WHEN n.action_result = 'ATTEMPTED'      THEN 1 ELSE 0 END) AS nb_tentatives,
    SUM(CASE WHEN n.action_result = 'CANCELLED'      THEN 1 ELSE 0 END) AS nb_annulations,
    SUM(CASE WHEN n.action_result = 'ERROR_REDIRECT' THEN 1 ELSE 0 END) AS nb_erreurs,
    MAX(n.created_at)                           AS derniere_activite
FROM audit_navigation n
WHERE n.created_at >= DATEADD(hour, -24, GETDATE())
GROUP BY n.username, n.company_code;
GO

PRINT 'Vue v_audit_user_activity_24h créée.';
GO
