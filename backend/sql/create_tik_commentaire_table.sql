-- ============================================================
-- Module TIK — Fil de discussion (lot 3)
-- Base : SQL Server (HFF_INTRANET_TEST_01)
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'tik_commentaire' AND type = 'U')
BEGIN
    CREATE TABLE tik_commentaire (
        id          INT           IDENTITY(1,1) NOT NULL,
        tik_id      INT           NOT NULL,
        user_id     INT           NOT NULL,
        commentaire NVARCHAR(MAX) NOT NULL,

        -- Pièces jointes : JSON [{"name":"...","storedName":"...","sizeKb":n}]
        -- Stockées dans le même dossier que les pièces jointes du ticket
        -- (var/uploads/tik/{numeroTicket}/), servies via la même route
        -- authentifiée GET /api/tik/tickets/{id}/fichiers/{storedName}.
        file_names  NVARCHAR(MAX) NULL,

        created_at  DATETIME      NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_tik_commentaire PRIMARY KEY (id),
        CONSTRAINT FK_tik_commentaire_tik  FOREIGN KEY (tik_id)  REFERENCES tik_ticket(id),
        CONSTRAINT FK_tik_commentaire_user FOREIGN KEY (user_id) REFERENCES app_user(id)
    );

    CREATE INDEX idx_tik_commentaire_tik ON tik_commentaire (tik_id);

    PRINT 'Table tik_commentaire créée.';
END
GO
