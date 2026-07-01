import { CardIcon } from "./CardIcon.jsx";

export function CardDisplay({ id, card, count }) {
  return (
    <div className={`collection-card ${card.rarity}`} data-card-id={id}>
      <div className="collection-card-inner">
        <header className="collection-card-top">
          <strong>{card.name}</strong>
          <span className="collection-card-cost">Cost {card.cost}</span>
        </header>
        <div className="collection-card-art" aria-hidden="true">
          <CardIcon id={id} />
        </div>
        <div className="collection-card-text">
          <p>{card.desc}</p>
        </div>
        {count != null ? <span className="collection-card-count">持有：{count} 張</span> : null}
      </div>
    </div>
  );
}
