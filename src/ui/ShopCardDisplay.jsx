import { CardDisplay } from "./CardDisplay.jsx";

export function ShopCardDisplay({ id, card, item, index }) {
  return (
    <div className={`shop-card${item.sold ? " sold" : ""}`}>
      <CardDisplay id={id} card={card} />
      <button className="nes-btn" data-shop-index={index} disabled={item.sold}>
        {item.sold ? "已售出" : `購買 ${item.price} Gold`}
      </button>
    </div>
  );
}
