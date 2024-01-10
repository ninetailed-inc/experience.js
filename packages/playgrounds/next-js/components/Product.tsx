type ProductProps = { productName: string; onClick: () => void };

export const Product: React.FC<ProductProps> = (props) => {
  return (
    <div>
      <span>product name: {props.productName}</span>
    </div>
  );
};
