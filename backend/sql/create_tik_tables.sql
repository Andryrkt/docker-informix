-- ============================================================
-- Module TIK — Ticketing support informatique (lot 1)
-- Base : SQL Server (HFF_INTRANET_TEST_01)
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tik_categorie' AND type = 'U')
BEGIN
    CREATE TABLE tik_categorie (
        id          INT           IDENTITY(1,1) NOT NULL,
        description NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_tik_categorie PRIMARY KEY (id)
    );
    PRINT 'Table tik_categorie créée.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tik_sous_categorie' AND type = 'U')
BEGIN
    CREATE TABLE tik_sous_categorie (
        id           INT           IDENTITY(1,1) NOT NULL,
        description  NVARCHAR(100) NOT NULL,
        categorie_id INT           NOT NULL,
        CONSTRAINT PK_tik_sous_categorie PRIMARY KEY (id),
        CONSTRAINT FK_tik_souscat_categorie FOREIGN KEY (categorie_id) REFERENCES tik_categorie(id)
    );
    CREATE INDEX idx_tik_souscat_categorie ON tik_sous_categorie (categorie_id);
    PRINT 'Table tik_sous_categorie créée.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tik_autres_categorie' AND type = 'U')
BEGIN
    CREATE TABLE tik_autres_categorie (
        id                INT           IDENTITY(1,1) NOT NULL,
        description       NVARCHAR(100) NOT NULL,
        sous_categorie_id INT           NOT NULL,
        CONSTRAINT PK_tik_autres_categorie PRIMARY KEY (id),
        CONSTRAINT FK_tik_autrescat_souscat FOREIGN KEY (sous_categorie_id) REFERENCES tik_sous_categorie(id)
    );
    CREATE INDEX idx_tik_autrescat_souscat ON tik_autres_categorie (sous_categorie_id);
    PRINT 'Table tik_autres_categorie créée.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tik_ticket' AND type = 'U')
BEGIN
    CREATE TABLE tik_ticket (
        id                   INT            IDENTITY(1,1) NOT NULL,
        numero_ticket        NVARCHAR(20)   NOT NULL,
        objet_demande        NVARCHAR(255)  NOT NULL,
        detail_demande       NVARCHAR(MAX)  NOT NULL,

        categorie_id         INT            NOT NULL,
        sous_categorie_id    INT            NULL,
        autres_categorie_id  INT            NULL,
        niveau_urgence       NVARCHAR(5)    NOT NULL DEFAULT 'P4',

        demandeur_id         INT            NOT NULL,
        agence_emetteur_id   INT            NULL,
        service_emetteur_id  INT            NULL,
        agence_debiteur_id   INT            NULL,
        service_debiteur_id  INT            NULL,

        parc_informatique    NVARCHAR(100)  NULL,
        date_fin_souhaitee   DATETIME       NOT NULL,

        statut               NVARCHAR(20)   NOT NULL DEFAULT 'OUVERT',

        intervenant_id       INT            NULL,
        date_debut_planning  DATETIME       NULL,
        date_fin_planning    DATETIME       NULL,

        -- Pièces jointes : JSON [{"name":"...","storedName":"...","sizeKb":n}]
        -- Fichiers stockés hors de public/ (var/uploads/tik/), servis via une
        -- route authentifiée — jamais dans public/ qui est exposé sans contrôle d'accès.
        file_names           NVARCHAR(MAX)  NULL,

        created_at           DATETIME       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_tik_ticket PRIMARY KEY (id),
        CONSTRAINT UQ_tik_numero_ticket UNIQUE (numero_ticket),
        CONSTRAINT FK_tik_categorie        FOREIGN KEY (categorie_id)        REFERENCES tik_categorie(id),
        CONSTRAINT FK_tik_sous_categorie   FOREIGN KEY (sous_categorie_id)   REFERENCES tik_sous_categorie(id),
        CONSTRAINT FK_tik_autres_categorie FOREIGN KEY (autres_categorie_id) REFERENCES tik_autres_categorie(id),
        CONSTRAINT FK_tik_demandeur        FOREIGN KEY (demandeur_id)        REFERENCES app_user(id),
        CONSTRAINT FK_tik_agence_emetteur  FOREIGN KEY (agence_emetteur_id)  REFERENCES app_agency(id),
        CONSTRAINT FK_tik_service_emetteur FOREIGN KEY (service_emetteur_id) REFERENCES app_service(id),
        CONSTRAINT FK_tik_agence_debiteur  FOREIGN KEY (agence_debiteur_id)  REFERENCES app_agency(id),
        CONSTRAINT FK_tik_service_debiteur FOREIGN KEY (service_debiteur_id) REFERENCES app_service(id),
        CONSTRAINT FK_tik_intervenant      FOREIGN KEY (intervenant_id)      REFERENCES app_personnel(id)
    );

    CREATE INDEX idx_tik_statut      ON tik_ticket (statut);
    CREATE INDEX idx_tik_demandeur   ON tik_ticket (demandeur_id);
    CREATE INDEX idx_tik_intervenant ON tik_ticket (intervenant_id);

    PRINT 'Table tik_ticket créée.';
END
GO

-- ── Données de référence : catégories (portées du legacy) ────────────────────
IF NOT EXISTS (SELECT * FROM tik_categorie)
BEGIN
    INSERT INTO tik_categorie (description) VALUES
        ('APPLICATION METIER'),
        ('MATERIELS'),
        ('BUREAUTIQUE'),
        ('SECURITE'),
        ('MESSAGERIE'),
        ('RESEAU INFORMATIQUE'),
        ('SERVICE DIVERS'),
        ('SERVICE INTERNET'),
        ('REPORTING');
    PRINT 'Catégories TIK initialisées.';
END
GO
