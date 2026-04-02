import { useWishlistModel } from './wishlist.model'
import { WishlistView } from './wishlist.view'

export function WishlistPage() {
  const model = useWishlistModel()
  return <WishlistView {...model} />
}

export default WishlistPage

