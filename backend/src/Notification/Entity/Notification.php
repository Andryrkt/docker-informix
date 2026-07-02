<?php

namespace App\Notification\Entity;

use App\Notification\Repository\NotificationRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NotificationRepository::class)]
#[ORM\Table(name: 'app_notification')]
#[ORM\Index(columns: ['user_id', 'is_read'], name: 'idx_notification_user')]
#[ORM\Index(columns: ['created_at'], name: 'idx_notification_date')]
class Notification
{
    public const SOURCE_NAVIGATION = 'NAVIGATION';
    public const SOURCE_OPERATION  = 'OPERATION';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'user_id', type: 'integer')]
    private int $userId;

    #[ORM\Column(name: 'source', type: 'string', length: 20)]
    private string $source;

    #[ORM\Column(name: 'title', type: 'string', length: 255)]
    private string $title;

    #[ORM\Column(name: 'message', type: 'text', nullable: true)]
    private ?string $message = null;

    #[ORM\Column(name: 'page_url', type: 'string', length: 500, nullable: true)]
    private ?string $pageUrl = null;

    #[ORM\Column(name: 'is_read', type: 'boolean')]
    private bool $isRead = false;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getUserId(): int { return $this->userId; }
    public function setUserId(int $userId): static { $this->userId = $userId; return $this; }

    public function getSource(): string { return $this->source; }
    public function setSource(string $source): static { $this->source = $source; return $this; }

    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): static { $this->title = $title; return $this; }

    public function getMessage(): ?string { return $this->message; }
    public function setMessage(?string $message): static { $this->message = $message; return $this; }

    public function getPageUrl(): ?string { return $this->pageUrl; }
    public function setPageUrl(?string $pageUrl): static { $this->pageUrl = $pageUrl; return $this; }

    public function isRead(): bool { return $this->isRead; }
    public function setIsRead(bool $isRead): static { $this->isRead = $isRead; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
