-- ============================================================
-- Support IT — Gestion des tâches
-- Base : SQL Server (HFF_INTRANET_TEST_01)
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'it_tache' AND type = 'U')
BEGIN
    CREATE TABLE it_tache (
        id               INT            IDENTITY(1,1) NOT NULL,
        titre            NVARCHAR(255)  NOT NULL,
        date_tache       DATETIME       NOT NULL,
        intervenant_id   INT            NOT NULL,

        -- Référence de ticket externe — facultative
        ticket_ref       NVARCHAR(100)  NULL,

        termine          BIT            NOT NULL DEFAULT 0,
        created_at       DATETIME       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_it_tache PRIMARY KEY (id),
        CONSTRAINT FK_it_tache_personnel FOREIGN KEY (intervenant_id) REFERENCES app_personnel(id)
    );

    CREATE INDEX idx_tache_date        ON it_tache (date_tache);
    CREATE INDEX idx_tache_intervenant ON it_tache (intervenant_id);

    PRINT 'Table it_tache créée.';
END
ELSE
    PRINT 'Table it_tache déjà existante — ignorée.';
GO
