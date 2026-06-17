import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../../components/shop/ProductCard';
import { ProductGridSkeleton, SectionHeader } from '../../components/common/LoadingScreen';
import { bannerAPI, productAPI } from '../../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Mumbai', rating: 5, text: 'Absolutely love the quality. The cashmere sweater is incredibly soft and the packaging was beautiful.', avatar: 'P' },
  { name: 'Rahul M.', location: 'Delhi', rating: 5, text: 'The Oxford shirt fits perfectly and the fabric is premium. Will definitely shop again!', avatar: 'R' },
  { name: 'Ananya K.', location: 'Bangalore', rating: 5, text: 'My floral dress arrived quickly and looked exactly like the photos. Perfect for my event!', avatar: 'A' },
  { name: 'Kiran V.', location: 'Chennai', rating: 5, text: 'Best fashion brand online. The attention to detail in every piece is remarkable.', avatar: 'K' },
];

const INSTAGRAM_POSTS = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
  'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400',
];

export default function HomePage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannersRes, featuredRes, newRes, bestRes, trendRes] = await Promise.all([
          bannerAPI.getAll({ position: 'hero' }),
          productAPI.getAll({ isFeatured: true, limit: 4 }),
          productAPI.getAll({ isNewArrival: true, limit: 8 }),
          productAPI.getAll({ isBestSeller: true, limit: 8 }),
          productAPI.getAll({ isTrending: true, limit: 4 }),
        ]);
        setBanners(bannersRes.data.banners || []);
        setFeatured(featuredRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
        setBestSellers(bestRes.data.products || []);
        setTrending(trendRes.data.products || []);
      } catch (err) {
        console.error('Homepage load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Default hero banners if API not loaded
  const heroBanners = banners.length > 0 ? banners : [
    { title: 'New Season Arrivals', subtitle: 'Discover the finest in luxury fashion', cta: { label: 'Shop Now', link: '/shop?isNewArrival=true' }, image: { url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920' } },
    { title: "Women's Collection", subtitle: 'Elegance redefined for the modern woman', cta: { label: 'Explore Women', link: '/shop?gender=women' }, image: { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920' } },
    { title: "Men's Essentials", subtitle: 'Classic pieces for every occasion', cta: { label: 'Shop Men', link: '/shop?gender=men' }, image: { url: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920' } },
  ];

  return (
    <>
      <Helmet>
        <title>LUXE — Premium Fashion Brand</title>
        <meta name="description" content="Discover timeless luxury fashion for men and women. Premium quality, modern design." />
      </Helmet>

      {/* ── Hero Slider ─────────────────────────────────────────────── */}
      <section className="relative mt-[calc(theme(spacing.16)+theme(spacing.8))]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation
          pagination={{ clickable: true }}
          loop
          className="w-full h-[70vh] md:h-[85vh]"
        >
          {heroBanners.map((banner, i) => (
            <SwiperSlide key={i}>
              <div className="relative w-full h-full">
                <img
                  src={banner.image?.url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="page-container">
                    <motion.div
                      key={i}
                      initial="hidden"
                      animate="visible"
                      variants={fadeUp}
                      className="max-w-lg text-white"
                    >
                      <motion.p variants={fadeUp} custom={0} className="text-2xs tracking-super-wide uppercase text-luxe-gold mb-4 font-medium">
                        New Collection
                      </motion.p>
                      <motion.h1 variants={fadeUp} custom={1} className="font-display text-5xl md:text-7xl font-medium leading-tight mb-4">
                        {banner.title}
                      </motion.h1>
                      <motion.p variants={fadeUp} custom={2} className="text-white/80 text-lg mb-8">
                        {banner.subtitle}
                      </motion.p>
                      <motion.div variants={fadeUp} custom={3} className="flex gap-4">
                        <Link to={banner.cta?.link || '/shop'} className="btn-gold">
                          {banner.cta?.label || 'Shop Now'}
                        </Link>
                        <Link to="/shop" className="inline-flex items-center gap-2 text-white text-xs tracking-widest uppercase border-b border-white/40 hover:border-white pb-0.5 transition-colors">
                          Explore All <ArrowRight size={12} />
                        </Link>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── Category Quick Links ──────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Women's", sub: 'Collection', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', link: '/shop?gender=women' },
            { label: "Men's", sub: 'Collection', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600', link: '/shop?gender=men' },
            { label: 'New', sub: 'Arrivals', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600', link: '/shop?isNewArrival=true' },
            { label: 'Sale', sub: 'Up to 60% off', img: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600', link: '/shop?isOnSale=true' },
          ].map(({ label, sub, img, link }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={link} className="group block relative overflow-hidden aspect-[3/4]">
                <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-2xs tracking-super-wide uppercase text-luxe-gold mb-1">{sub}</p>
                  <h3 className="font-display text-2xl font-medium">{label}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────── */}
      {(loading || featured.length > 0) && (
        <section className="page-container pb-20">
          <SectionHeader tag="Curated for You" title="Featured Pieces" subtitle="Handpicked selections from our latest collections" className="mb-10" />
          {loading ? <ProductGridSkeleton count={4} /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          )}
        </section>
      )}

      {/* ── Promo Banner ─────────────────────────────────────────── */}
      <section className="bg-luxe-cream py-20">
        <div className="page-container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="section-tag">Limited Time</span>
              <h2 className="section-title mb-4">Seasonal Sale<br />Up to 60% Off</h2>
              <p className="text-luxe-muted mb-8">Don't miss our biggest sale of the season. Premium quality pieces at exceptional prices, for a limited time only.</p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/shop?isOnSale=true" className="btn-primary">Shop Sale</Link>
                <Link to="/shop" className="btn-outline">View All</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400',
                'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              ].map((img, i) => (
                <div key={i} className="aspect-[3/4] overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── New Arrivals ──────────────────────────────────────────── */}
      {(loading || newArrivals.length > 0) && (
        <section className="page-container py-20">
          <div className="flex items-end justify-between mb-10">
            <SectionHeader tag="Just In" title="New Arrivals" className="text-left" />
            <Link to="/shop?isNewArrival=true" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-luxe-muted hover:text-luxe-black transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? <ProductGridSkeleton count={4} /> : (
            <>
              <div className="hidden md:grid grid-cols-4 gap-6">
                {newArrivals.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              <Swiper
                modules={[]}
                slidesPerView={1.5}
                spaceBetween={16}
                breakpoints={{ 480: { slidesPerView: 2.2 }, 640: { slidesPerView: 2.5 } }}
                className="md:hidden"
              >
                {newArrivals.map((p, i) => (
                  <SwiperSlide key={p._id}>
                    <ProductCard product={p} index={i} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
        </section>
      )}

      {/* ── Best Sellers ─────────────────────────────────────────── */}
      {(loading || bestSellers.length > 0) && (
        <section className="bg-luxe-bg-soft py-20">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <SectionHeader tag="Fan Favourites" title="Best Sellers" className="text-left" />
              <Link to="/shop?isBestSeller=true" className="hidden md:flex items-center gap-2 text-xs tracking-widest uppercase text-luxe-muted hover:text-luxe-black transition-colors">
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? <ProductGridSkeleton count={4} /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {bestSellers.slice(0, 4).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Gender Collections ────────────────────────────────────── */}
      <section className="page-container py-20">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { gender: 'women', title: "Women's Collection", sub: 'Elegance & Style', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900' },
            { gender: 'men', title: "Men's Collection", sub: 'Classic & Modern', img: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900' },
          ].map(({ gender, title, sub, img }) => (
            <motion.div
              key={gender}
              initial={{ opacity: 0, x: gender === 'women' ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link to={`/shop?gender=${gender}`} className="group relative block overflow-hidden aspect-video md:aspect-[4/3]">
                <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-2xs tracking-super-wide uppercase text-luxe-gold mb-2">{sub}</p>
                  <h3 className="font-display text-3xl font-medium mb-4">{title}</h3>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase border-b border-white/40 group-hover:border-luxe-gold transition-colors pb-0.5">
                    Shop Now <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="bg-luxe-black py-20">
        <div className="page-container">
          <SectionHeader tag="Customer Love" title="What Our Customers Say" className="mb-12 [&_.section-title]:text-white [&_.section-tag]:text-luxe-gold" />
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            slidesPerView={1}
            spaceBetween={24}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
          >
            {TESTIMONIALS.map((t, i) => (
              <SwiperSlide key={i}>
                <div className="bg-white/5 border border-white/10 p-6 h-full">
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= t.rating ? 'text-luxe-gold' : 'text-white/20'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-9 h-9 rounded-full bg-luxe-gold flex items-center justify-center text-white font-semibold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-white/40 text-xs">{t.location}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* ── Instagram Gallery ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="text-center mb-8">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-luxe-black hover:text-luxe-gold transition-colors">
            <Instagram size={20} />
            <span className="text-sm tracking-widest uppercase font-medium">@luxefashion</span>
          </a>
          <p className="text-luxe-muted text-sm mt-1">Follow us for daily style inspiration</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {INSTAGRAM_POSTS.map((img, i) => (
            <motion.a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden aspect-square"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.a>
          ))}
        </div>
      </section>
    </>
  );
}
