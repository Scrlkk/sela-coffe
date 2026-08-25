export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
  isDeleted?: boolean;
  is_active?: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}
