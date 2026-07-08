-- ============================================================
-- Notifications admin — alerte sur erreurs/échecs d'audit
-- Base : SQL Server (HFF_INTRANET_TEST_01)
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'app_notification' AND type = 'U')
BEGIN
    CREATE TABLE app_notification (
        id          INT            IDENTITY(1,1) NOT NULL,
        user_id     INT            NOT NULL,

        -- NAVIGATION | OPERATION
        source      NVARCHAR(20)   NOT NULL,

        title       NVARCHAR(255)  NOT NULL,
        message     NVARCHAR(MAX)  NULL,
        page_url    NVARCHAR(500)  NULL,

        is_read     BIT            NOT NULL DEFAULT 0,
        created_at  DATETIME       NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_app_notification PRIMARY KEY (id)
    );

    CREATE INDEX idx_notification_user ON app_notification (user_id, is_read);
    CREATE INDEX idx_notification_date ON app_notification (created_at);

    PRINT 'Table app_notification créée.';
END
ELSE
    PRINT 'Table app_notification déjà existante — ignorée.';
GO
