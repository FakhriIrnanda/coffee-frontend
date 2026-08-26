'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { name: string };
    product: { name: string };
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`text-lg ${star <= rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
        ))}
    </div>
);

export default function TestimonialsSection() {
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        api.get('/reviews/latest').catch(() => {});
        // Fetch latest reviews dari semua produk
        api.get('/reviews/featured')
            .then(res => setReviews(res.data))
            .catch(() => setReviews([]));
    }, []);

    if (reviews.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
                <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                >
                    <StarRating rating={review.rating} />
                    <p className="text-stone-600 text-sm leading-relaxed mt-3 mb-4 italic">
                        "{review.comment}"
                    </p>
                    <div className="border-t border-stone-100 pt-4">
                        <p className="font-semibold text-stone-800 text-sm">{review.user.name}</p>
                        <p className="text-amber-600 text-xs mt-0.5">{review.product.name}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}