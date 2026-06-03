import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, Clock, Sparkles } from "lucide-react";
import { Product, Review } from "../types";
import { dbService, UserSession } from "../services/firebase";

interface ReviewsSectionProps {
  product: Product;
  currentUser: UserSession | null;
  onLoginTrigger: () => void;
}

export default function ReviewsSection({
  product,
  currentUser,
  onLoginTrigger,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let active = true;
    const fetchReviews = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const fetched = await dbService.getReviews(product.id);
        if (active) {
          setReviews(fetched);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        if (active) {
          setErrorMsg("Could not fetch reviews. Try refreshing.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchReviews();
    return () => {
      active = false;
    };
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!commentInput.trim()) {
      setErrorMsg("Review comment cannot be empty.");
      return;
    }

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const payload = {
        productId: product.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        rating: ratingInput,
        comment: commentInput.trim(),
      };

      const newReview = await dbService.addReview(payload);
      setReviews((prev) => [newReview, ...prev]);
      setCommentInput("");
      setRatingInput(5);
      setSuccessMsg("Your review has been successfully processed.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setErrorMsg("Failed to post your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper metrics
  const totalReviewsCount = reviews.length;
  const averageRatingValue =
    totalReviewsCount > 0
      ? parseFloat(
          (
            reviews.reduce((acc, curr) => acc + curr.rating, 0) /
            totalReviewsCount
          ).toFixed(1)
        )
      : 0;

  return (
    <div className="w-full mt-16 pt-12 border-t border-zinc-900" id="reviews-portal">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COMPONENT: Review Statistics & Summary Grid */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#050505] border border-zinc-900 p-6 md:p-8 flex flex-col justify-between relative">
            <span className="text-[#EFFF00] font-mono text-[9px] tracking-widest block uppercase font-bold mb-1">
              [ APPAREL PERFORMANCE ]
            </span>
            <h3 className="text-xl font-sans font-black text-white uppercase tracking-tight">
              PATRON FEEDBACK
            </h3>
            <p className="text-zinc-550 text-xs font-sans mt-1.5 leading-relaxed">
              Verify actual feedback and star ratings on garment fit, stitching weight, and fabric structure directly from the community.
            </p>

            {/* Large aggregate rating billboard */}
            <div className="my-8 flex items-end gap-4 border-t border-b border-zinc-950 py-6">
              <span className="font-mono text-5xl font-black text-white bg-[#111105] border border-[#EFFF00]/10 px-4 py-2">
                {averageRatingValue > 0 ? averageRatingValue : "—"}
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={15}
                      className={
                        star <= Math.round(averageRatingValue)
                          ? "text-[#EFFF00] fill-[#EFFF00]"
                          : "text-zinc-800"
                      }
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-[#EFFF00] uppercase tracking-wider block font-bold">
                  {totalReviewsCount} {totalReviewsCount === 1 ? "VERIFIED REVIEW" : "VERIFIED REVIEWS"}
                </span>
              </div>
            </div>

            {/* Custom star breakout indicators */}
            <div className="flex flex-col gap-2 font-mono text-[9px] text-zinc-500">
              {[5, 4, 3, 2, 1].map((lvl) => {
                const lvlCount = reviews.filter((r) => r.rating === lvl).length;
                const percentage =
                  totalReviewsCount > 0
                    ? Math.round((lvlCount / totalReviewsCount) * 105)
                    : 0;

                return (
                  <div key={lvl} className="flex items-center gap-3">
                    <span className="w-9 text-zinc-400 font-bold">{lvl} STAR</span>
                    <div className="flex-1 h-1.5 bg-zinc-950 border border-zinc-900 inline-block relative overflow-hidden">
                      <div
                        className="h-full bg-[#EFFF00] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-5 text-right font-bold text-zinc-400">
                      ({lvlCount})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Review List and Submission form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Submitting review dialog or call to action to login */}
          <div className="bg-[#050505] border border-zinc-900 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquarePlus size={14} className="text-[#EFFF00]" />
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest font-black">
                SUBMIT A VERIFIED RATING
              </span>
            </div>

            {currentUser ? (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Visual stars interactive feedback */}
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase">
                    Your Rating:
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive =
                        hoveredRating !== null
                          ? star <= hoveredRating
                          : star <= ratingInput;
                      return (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingInput(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            size={18}
                            className={
                              isActive
                                ? "text-[#EFFF00] fill-[#EFFF00]"
                                : "text-zinc-850 hover:text-[#EFFF00]"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment box */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="patron-review-comment"
                    className="font-mono text-[9px] text-zinc-550 uppercase"
                  >
                    Your Feedback text
                  </label>
                  <textarea
                    id="patron-review-comment"
                    rows={3}
                    maxLength={1000}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe how the garment fits, fabric texture, feel, etc."
                    className="w-full bg-[#08080a] border border-zinc-900 focus:border-[#EFFF00] focus:ring-0 py-2 px-3 font-sans text-xs text-white placeholder-zinc-700 outline-none transition-colors rounded-none resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex flex-col">
                    {successMsg && (
                      <span className="text-emerald-400 font-mono text-[9px] uppercase font-bold">
                        ✦ {successMsg}
                      </span>
                    )}
                    {errorMsg && (
                      <span className="text-red-400 font-mono text-[9px] uppercase font-bold">
                        Δ {errorMsg}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-white hover:bg-[#EFFF00] disabled:bg-zinc-800 text-black disabled:text-zinc-550 font-mono font-black text-xs px-6 py-2.5 tracking-widest transition-colors uppercase cursor-pointer rounded-none flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        POSTING...
                      </>
                    ) : (
                      "SUBMIT REVIEW"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 border border-dashed border-zinc-900 bg-black/40 text-center">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-3">
                  PATRON IDENTIFICATION CONFIRMATION REQUIRED
                </span>
                <p className="font-sans text-[11px] text-zinc-550 max-w-sm mx-auto mb-4 leading-relaxed">
                  To assure reviews are legitimate, we mandate authenticating via the secure Cactus Bear client portal before leaving a rating.
                </p>
                <button
                  type="button"
                  onClick={onLoginTrigger}
                  className="border border-[#EFFF00]/30 hover:border-[#EFFF00] bg-black hover:bg-[#EFFF00]/5 text-[#EFFF00] px-5 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors cursor-pointer"
                >
                  AUTHENTICATE HERE ⟶
                </button>
              </div>
            )}
          </div>

          {/* List of actual reviews */}
          <div className="flex flex-col gap-4">
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="font-mono text-[10px] text-zinc-550 uppercase tracking-widest font-black">
                REVIEWS LOGS ({totalReviewsCount})
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                FETCHING SECURED FEEDBACKS...
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center text-zinc-650 border border-zinc-950 font-mono text-[10px] uppercase tracking-widest">
                NO FEEDBACKS FILED YET // BE THE FIRST TO POST
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 border border-zinc-900 bg-[#050505]"
                  >
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userPhoto || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${rev.userName}`}
                          alt={rev.userName}
                          className="w-7 h-7 rounded-none border border-zinc-900 bg-zinc-950"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-sans font-extrabold text-xs text-white uppercase block leading-none">
                            {rev.userName}
                          </span>
                          <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-widest block mt-1">
                            VERIFIED CLIENT
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-zinc-550">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              size={11}
                              className={
                                st <= rev.rating
                                  ? "text-[#EFFF00] fill-[#EFFF00]"
                                  : "text-zinc-800"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[8px] text-zinc-550 flex items-center gap-1">
                          <Clock size={8} /> {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs font-sans mt-3 whitespace-pre-wrap leading-relaxed border-t border-zinc-950 pt-2.5">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
