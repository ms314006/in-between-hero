import { CardIcon } from "./CardIcon.jsx";

export function CompactCardDisplay({ id, card, count }) {
  return (
    <div className={`compact-card ${card.rarity}`} data-card-id={id} title={`${card.name}｜持有：${count} 張`}>
      <div className="compact-card-inner" aria-hidden="true">
        <div className="compact-card-title-block" />
        <div className="compact-card-art">
          <CardIcon id={id} className="compact-card-icon" size={96} />
        </div>
        <div className="compact-card-text-block" />
      </div>
      {count != null ? <span className="compact-card-count">持有：{count} 張</span> : null}
    </div>
  );
}
