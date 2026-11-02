import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { AppArtwork } from "./AppArtwork";
import type { Item, Work } from "./schema";
export function notificationContent(
  text: string,
  apps: Work["apps"],
  instagramItems: Item[] = [],
) {
  const separator = text.search(/[:：]/);
  const sender = separator > 0 ? text.slice(0, separator) : "信息";
  const body = separator > 0 ? text.slice(separator + 1) : text;
  const app = apps.find((a) => a.name === sender);
  const newPost = app?.id === "instagram" && body.match(/^\s*(.+?) 发布了新动态：(.+)$/);
  const itemId = newPost
    ? instagramItems.find(
        (item) =>
          item.sender === newPost[1] &&
          (item.title === newPost[2] || item.body === newPost[2]),
      )?.id
    : undefined;
  return {
    title: sender,
    body,
    appId: app?.id ?? "messages",
    itemId,
  };
}
export function SystemNotifications({
  notices,
  apps,
  instagramItems = [],
  onOpen,
  onDismiss,
  compact = false,
}: {
  notices: string[];
  apps: Work["apps"];
  onOpen: (appId: string, itemId?: string) => void;
  onDismiss: (index: number) => void;
  instagramItems?: Item[];
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = notices.map((text, index) => ({ text, index })).reverse();
  const shown = compact && !expanded ? entries.slice(0, 1) : entries;
  return (
    <div
      className={
        "device-notices " +
        (compact && !expanded && notices.length > 1 ? "notice-stacked" : "")
      }
    >
      <div className="notice-cards">
        {shown.map(({ text, index }) => {
          const n = notificationContent(text, apps, instagramItems);
          return (
            <motion.div
              layout
              className="device-notice"
              key={text + "::" + index}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) onDismiss(index);
              }}
            >
              <button className="notice-open" onClick={() => onOpen(n.appId, n.itemId)}>
                <span className="notice-app-art">
                  <AppArtwork id={n.appId} />
                </span>
                <span className="notice-copy">
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </span>
                <time>现在</time>
              </button>
              {!compact && (
                <button
                  className="notice-remove"
                  aria-label="清除通知"
                  onClick={() => onDismiss(index)}
                >
                  <X size={15} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      {compact && notices.length > 1 && (
        <button
          className="notice-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "收起" : notices.length + " 条通知"}
        </button>
      )}
    </div>
  );
}

