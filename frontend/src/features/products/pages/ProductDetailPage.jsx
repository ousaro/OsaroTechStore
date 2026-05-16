import { useState, useEffect } from "react";
import { useProducts } from "../hooks/useProducts.js";
import { useCart } from "../../cart/hooks/useCart.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useNavigate } from "../../../hooks/useNavigate.js";
import { Badge } from "../../../components/ui/Badge.jsx";
import { QtyControl } from "../../../components/ui/QtyControl.jsx";
import { Spinner } from "../../../components/ui/Spinner.jsx";
import { Link } from "../../../components/ui/Link.jsx";
import { Avatar } from "../../../components/ui/Avatar.jsx";
import { ProductImage } from "../../../components/ui/ProductImage.jsx";
import { Select } from "../../../components/ui/Select.jsx";
import { FiCreditCard, FiEdit2, FiMessageSquare, FiRefreshCcw, FiShoppingBag, FiShield, FiStar, FiTrash2, FiTruck } from "react-icons/fi";

export function ProductDetailPage({ id }) {
  const { products, getProductById, deleteProduct, addProductReview } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useNavigate();

  const [product, setProduct]   = useState(() => products.find((p) => p.id === id) || null);
  const [loading, setLoading]   = useState(!product);
  const [qty, setQty]           = useState(1);
  const [adding, setAdding]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (product) return;
    getProductById(id).then(setProduct).catch(() => navigate("/products")).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  if (loading) return <Spinner full />;
  if (!product) return null;

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(product.id, qty); }
    catch {
      // Toasted by the service layer.
    }
    finally { setAdding(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setDeleting(true);
    try { await deleteProduct(product.id); navigate("/products"); }
    catch {
      // Toasted by the service layer.
    }
    finally { setDeleting(false); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user || !reviewDraft.comment.trim()) return;
    setReviewError("");
    try {
      const updatedProduct = await addProductReview(product.id, {
        name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Customer",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        picture: user.picture || "",
        rating: Number(reviewDraft.rating),
        comment: reviewDraft.comment.trim(),
      });
      setProduct(updatedProduct);
      setReviewDraft({ rating: 5, comment: "" });
    } catch (error) {
      setReviewError(error?.message || "Could not post your comment. Please try again.");
    }
  };

  const images = product.images.length ? product.images : [null];
  const reviews = product.reviews || [];
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="page-shell">
      <div className="breadcrumb"><Link to="/products">Products</Link> / <span>{product.name}</span></div>
      <div className="mt-2 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,.95fr)] lg:gap-12">
        <div>
          <div className="product-detail-media">
            <ProductImage src={images[activeImg]} alt={product.name} placeholderSize={82} />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.slice(0,6).map((img,i) => (
                <div key={i} onClick={() => setActiveImg(i)} className={`flex h-[72px] w-[72px] cursor-pointer items-center justify-center overflow-hidden rounded-sm border-2 bg-surface-2 ${activeImg===i ? "border-accent" : "border-border"}`}>
                  <ProductImage src={img} alt="" placeholderSize={22} imgClassName="h-full w-full object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="product-detail-panel">
          <div>
            <div className="mb-3 flex gap-2"><Badge status={product.status} />{product.category && <span className="rounded-sm bg-surface-3 px-2 py-0.5 text-xs font-semibold">{product.category}</span>}</div>
            <h1 className="mb-3 font-display text-[clamp(30px,4vw,46px)] font-extrabold leading-tight tracking-[-.03em]">{product.name}</h1>
            <div className="mb-3 text-4xl font-black tracking-[-1px] text-accent tabular-nums">
              <span className="text-lg font-bold">{product.price.currency} </span>{product.price.amount.toFixed(2)}
            </div>
            {product.description && <p className="text-[15px] leading-7 text-ink-muted">{product.description}</p>}
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-2">
            <span className={`status-dot ${product.inStock?(product.lowStock?"yellow":"green"):"red"}`} />
            <span className="text-sm font-semibold">
              {product.inStock ? (product.lowStock ? `Low stock — only ${product.stock} left` : `In stock (${product.stock} units)`) : "Out of stock"}
            </span>
          </div>
          {product.inStock && (
            <div className="flex flex-wrap items-center gap-3">
              <QtyControl value={qty} min={1} max={product.stock} onDecrement={() => setQty((q) => Math.max(1,q-1))} onIncrement={() => setQty((q) => Math.min(product.stock,q+1))} />
              <button className="btn btn-primary min-w-[180px] flex-1" onClick={handleAdd} disabled={adding}><FiShoppingBag /> {adding ? "Adding…" : "Add to cart"}</button>
            </div>
          )}
          <div className="product-trust-grid">
            <div><FiTruck /><span>Fast dispatch</span></div>
            <div><FiShield /><span>Protected payment</span></div>
            <div><FiRefreshCcw /><span>Easy support</span></div>
            <div><FiCreditCard /><span>Secure checkout</span></div>
          </div>
          {user?.isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/edit-product/${product.id}`} className="btn btn-ghost"><FiEdit2 /> Edit</Link>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}><FiTrash2 /> {deleting ? "Deleting…" : "Delete"}</button>
            </div>
          )}
        </div>
      </div>
      <section className="product-review-shell">
        <div className="product-review-summary card">
          <div>
            <div className="section-kicker">Customer feedback</div>
            <h2 className="text-[28px] font-extrabold text-ink">Comments and ratings</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">Helpful buying notes, quick reactions, and product impressions.</p>
          </div>
          <div className="review-score-block">
            <div className="review-score-value">{averageRating || "—"}</div>
            <div className="review-score-stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <FiStar key={index} className={averageRating && index < Math.round(Number(averageRating)) ? "fill-current" : ""} />
              ))}
            </div>
            <div className="review-score-meta">{reviews.length} comment{reviews.length === 1 ? "" : "s"}</div>
          </div>
        </div>
        <div className="product-review-grid">
          <div className="card product-review-form-card">
            <div className="mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-accent" />
              <h3 className="text-lg font-extrabold text-ink">Leave a comment</h3>
            </div>
            {user ? (
              <form onSubmit={submitReview} className="flex flex-col gap-4">
                {reviewError && <div className="error-box">{reviewError}</div>}
                <label className="field">
                  <span>Rating</span>
                  <Select value={reviewDraft.rating} onChange={(e) => setReviewDraft((current) => ({ ...current, rating: e.target.value }))}>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} star{rating === 1 ? "" : "s"}</option>)}
                  </Select>
                </label>
                <label className="field">
                  <span>Comment</span>
                  <textarea
                    className="input min-h-[140px] resize-y"
                    value={reviewDraft.comment}
                    onChange={(e) => setReviewDraft((current) => ({ ...current, comment: e.target.value }))}
                    placeholder="Share what stood out, what felt good, or what buyers should know."
                  />
                </label>
                <button type="submit" className="btn btn-primary self-start">Post comment</button>
              </form>
            ) : (
              <div className="empty-state px-0 py-6 text-left">
                <h3>Sign in to comment</h3>
                <p>Customer comments are available once you are logged in.</p>
              </div>
            )}
          </div>
          <div className="product-review-list">
            {reviews.length === 0 ? (
              <div className="card empty-state">
                <span className="icon"><FiMessageSquare size={26} /></span>
                <h3>No comments yet</h3>
                <p>This product is ready for its first review.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} className="card review-card">
                  <div className="review-card-head">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={review.picture}
                        name={review.name}
                        firstName={review.firstName}
                        lastName={review.lastName}
                        alt={review.name}
                        className="table-avatar"
                      />
                      <div>
                        <div className="font-extrabold text-ink">{review.name}</div>
                        <div className="text-xs text-ink-faint">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="review-inline-stars">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <FiStar key={index} className={index < review.rating ? "fill-current" : ""} />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink-muted">{review.comment}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
