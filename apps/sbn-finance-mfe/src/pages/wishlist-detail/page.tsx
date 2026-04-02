import { WishlistDetailView } from './wishlist-detail.view'
import { useWishlistDetailModel } from './wishlist-detail.model'

export function WishlistDetailPage() {
  const model = useWishlistDetailModel()
  return <WishlistDetailView {...model} />
}

export default WishlistDetailPage

