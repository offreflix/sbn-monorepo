export type WishlistCreateFormData = {
  name: string
  description: string
  price: number
  currency: string
  url: string
  imageUrl: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string
  notes: string
  installmentCount: number
  installmentValue: number
}
