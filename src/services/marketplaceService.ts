import { supabase } from '../lib/supabase';

export type PaymentMethod = 'aura_points' | 'ethiopian_birr';
export type ProductCategory = 'ebook' | 'video' | 'audio' | 'flashcards' | 'worksheet' | 'guide' | 'notes' | 'other';
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'sold_out';

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags?: string[];
  preview_image_url?: string;
  rating_average: number;
  total_sales: number;
  file_url?: string;
  payment_method: string;
  seller_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  downloads_allowed: boolean;
  shareable: boolean;
  printable: boolean;
  access_expiry_days: number;
  inventory_count: number;
}

export interface ProductPurchase {
  id: string;
  buyerId: string;
  productId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  transactionId: string | null;
  accessExpiresAt: string | null;
  purchasedAt: string;
  isActive: boolean;
  productTitle?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  reviewerName?: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: MarketplaceProduct;
}

export interface AuthorProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  totalProducts: number;
  totalSales: number;
  averageRating: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

class MarketplaceService {
  // Get all active products with seller information
  async getActiveProducts(filters?: {
    category?: ProductCategory;
    paymentMethod?: PaymentMethod;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    tags?: string[];
  }): Promise<MarketplaceProduct[]> {
    try {
      let query = supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        tags: product.tags || [],
        preview_image_url: product.preview_image_url,
        rating_average: parseFloat(product.rating_average || '0'),
        total_sales: product.total_sales || 0,
        file_url: product.file_url,
        payment_method: product.payment_method,
        seller_id: product.seller_id,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        downloads_allowed: product.downloads_allowed,
        shareable: product.shareable,
        printable: product.printable,
        access_expiry_days: product.access_expiry_days,
        inventory_count: product.inventory_count,
      }));
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Failed to load products');
    }
  }

  // Get tag statistics for all active products
  async getTagStatistics(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('tags')
        .eq('status', 'active');

      if (error) throw error;

      const tagCounts: Record<string, number> = {};
      data?.forEach(product => {
        product.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      return tagCounts;
    } catch (error: any) {
      console.error('Error fetching tag statistics:', error);
      return {};
    }
  }

  // Get product details with reviews
  async getProductDetails(productId: string): Promise<{
    product: MarketplaceProduct;
    reviews: ProductReview[];
  }> {
    try {
      const { data: productData, error: productError } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select(`
          *,
          reviewer:user_profiles!reviewer_id(full_name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const product: MarketplaceProduct = {
        id: productData.id,
        title: productData.title,
        description: productData.description,
        price: parseFloat(productData.price),
        category: productData.category,
        tags: productData.tags || [],
        preview_image_url: productData.preview_image_url,
        rating_average: parseFloat(productData.rating_average),
        total_sales: productData.total_sales,
        file_url: productData.file_url,
        payment_method: productData.payment_method,
        seller_id: productData.seller_id,
        status: productData.status,
        created_at: productData.created_at,
        updated_at: productData.updated_at,
        downloads_allowed: productData.downloads_allowed,
        shareable: productData.shareable,
        printable: productData.printable,
        access_expiry_days: productData.access_expiry_days,
        inventory_count: productData.inventory_count,
      };

      const reviews: ProductReview[] = (reviewsData || []).map(review => ({
        id: review.id,
        productId: review.product_id,
        reviewerId: review.reviewer_id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        reviewerName: review.reviewer?.full_name
      }));

      return { product, reviews };
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      throw new Error(error.message || 'Failed to load product details');
    }
  }

  // Purchase a product
  async purchaseProduct(productId: string, paymentMethod: PaymentMethod): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get product price
      const { data: product, error: productError } = await supabase
        .from('marketplace_products')
        .select('price, inventory_count, access_expiry_days')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (product.inventory_count <= 0) throw new Error('Product out of stock');

      // Calculate expiry date
      const accessExpiresAt = product.access_expiry_days > 0
        ? new Date(Date.now() + product.access_expiry_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('marketplace_purchases')
        .insert({
          buyer_id: user.id,
          product_id: productId,
          payment_method: paymentMethod,
          amount_paid: product.price,
          access_expires_at: accessExpiresAt,
          transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });

      if (purchaseError) throw purchaseError;
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      throw new Error(error.message || 'Failed to purchase product');
    }
  }

  // Get user's purchases
  async getUserPurchases(userId: string): Promise<ProductPurchase[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_purchases')
        .select(`
          *,
          product:marketplace_products!product_id(title)
        `)
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(purchase => ({
        id: purchase.id,
        buyerId: purchase.buyer_id,
        productId: purchase.product_id,
        paymentMethod: purchase.payment_method,
        amountPaid: parseFloat(purchase.amount_paid),
        transactionId: purchase.transaction_id,
        accessExpiresAt: purchase.access_expires_at,
        purchasedAt: purchase.purchased_at,
        isActive: purchase.is_active,
        productTitle: purchase.product?.title
      }));
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      throw new Error(error.message || 'Failed to load purchases');
    }
  }

  // Create product listing
  async createProduct(productData: Omit<MarketplaceProduct, 'id' | 'sellerId' | 'ratingAverage' | 'totalSales' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_products')
        .insert({
          seller_id: user.id,
          title: productData.title,
          description: productData.description,
          category: productData.category,
          price: productData.price,
          payment_method: productData.paymentMethod,
          status: productData.status,
          inventory_count: productData.inventoryCount,
          downloads_allowed: productData.downloadsAllowed,
          printable: productData.printable,
          shareable: productData.shareable,
          access_expiry_days: productData.accessExpiryDays,
          file_url: productData.fileUrl,
          preview_image_url: productData.previewImageUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  }

  // Add review
  async addReview(productId: string, rating: number, comment: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          reviewer_id: user.id,
          rating,
          comment
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding review:', error);
      throw new Error(error.message || 'Failed to add review');
    }
  }

  // Add item to cart
  async addToCart(productId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already in cart
      const { data: existing } = await supabase
        .from('shopping_cart')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        throw new Error('Item already in cart');
      }

      const { error } = await supabase
        .from('shopping_cart')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      throw new Error(error.message || 'Failed to add to cart');
    }
  }

  // Get user's cart items
  async getCartItems(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          product:marketplace_products!product_id(
            *,
            seller:user_profiles!seller_id(full_name, email)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        quantity: item.quantity,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        product: item.product ? {
          id: item.product.id,
          title: item.product.title,
          description: item.product.description,
          price: parseFloat(item.product.price),
          category: item.product.category,
          tags: item.product.tags || [],
          preview_image_url: item.product.preview_image_url,
          rating_average: parseFloat(item.product.rating_average),
          total_sales: item.product.total_sales,
          file_url: item.product.file_url,
          payment_method: item.product.payment_method,
          seller_id: item.product.seller_id,
          status: item.product.status,
          created_at: item.product.created_at,
          updated_at: item.product.updated_at,
          downloads_allowed: item.product.downloads_allowed,
          shareable: item.product.shareable,
          printable: item.product.printable,
          access_expiry_days: item.product.access_expiry_days,
          inventory_count: item.product.inventory_count,
        } : undefined
      }));
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      throw new Error(error.message || 'Failed to load cart');
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shopping_cart')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      throw new Error(error.message || 'Failed to remove from cart');
    }
  }

  // Get author profile
  async getAuthorProfile(authorId: string): Promise<AuthorProfile> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, banner_url, bio')
        .eq('id', authorId)
        .single();

      if (profileError) throw profileError;

      // Get author's products count and stats
      const { data: products, error: productsError } = await supabase
        .from('marketplace_products')
        .select('id, total_sales, rating_average')
        .eq('seller_id', authorId)
        .eq('status', 'active');

      if (productsError) throw productsError;

      const totalProducts = products?.length || 0;
      const totalSales = products?.reduce((sum, p) => sum + p.total_sales, 0) || 0;
      const averageRating = totalProducts > 0 
        ? products.reduce((sum, p) => sum + parseFloat(p.rating_average), 0) / totalProducts 
        : 0;

      return {
        id: profile.id,
        fullName: profile.full_name || 'Unknown Author',
        email: profile.email,
        avatarUrl: profile.avatar_url,
        bannerUrl: profile.banner_url,
        bio: profile.bio,
        totalProducts,
        totalSales,
        averageRating
      };
    } catch (error: any) {
      console.error('Error fetching author profile:', error);
      throw new Error(error.message || 'Failed to load author profile');
    }
  }

  // Get author's products
  async getAuthorProducts(authorId: string): Promise<MarketplaceProduct[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .eq('seller_id', authorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        tags: product.tags || [],
        preview_image_url: product.preview_image_url,
        rating_average: parseFloat(product.rating_average),
        total_sales: product.total_sales,
        file_url: product.file_url,
        payment_method: product.payment_method,
        seller_id: product.seller_id,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        downloads_allowed: product.downloads_allowed,
        shareable: product.shareable,
        printable: product.printable,
        access_expiry_days: product.access_expiry_days,
        inventory_count: product.inventory_count,
      }));
    } catch (error: any) {
      console.error('Error fetching author products:', error);
      throw new Error(error.message || 'Failed to load author products');
    }
  }

  // Search products by tags
  async searchProductsByTags(tags: string[]): Promise<MarketplaceProduct[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select(`
          *,
          seller:user_profiles!seller_id(full_name, email)
        `)
        .contains('tags', tags)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: parseFloat(product.price),
        category: product.category,
        tags: product.tags || [],
        preview_image_url: product.preview_image_url,
        rating_average: parseFloat(product.rating_average),
        total_sales: product.total_sales,
        file_url: product.file_url,
        payment_method: product.payment_method,
        seller_id: product.seller_id,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at,
        downloads_allowed: product.downloads_allowed,
        shareable: product.shareable,
        printable: product.printable,
        access_expiry_days: product.access_expiry_days,
        inventory_count: product.inventory_count,
      }));
    } catch (error: any) {
      console.error('Error searching products by tags:', error);
      throw new Error(error.message || 'Failed to search products');
    }
  }

  // Get all available tags from products
  async getAvailableTags(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_products')
        .select('tags')
        .eq('status', 'active');

      if (error) throw error;

      // Extract unique tags from all products
      const allTags = data?.flatMap(item => item.tags || []) || [];
      return Array.from(new Set(allTags)).sort();
    } catch (error: any) {
      console.error('Error fetching available tags:', error);
      throw new Error(error.message || 'Failed to load tags');
    }
  }
}

export const marketplaceService = new MarketplaceService();

export const getMarketplaceItems = async (filters?: {
  category?: string;
  search?: string;
  tags?: string[];
  priceRange?: { min: number; max: number };
}): Promise<MarketplaceItem[]> => {
  let query = supabase
    .from('marketplace_items')
    .select(`
      *,
      category:marketplace_categories(name)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Apply category filter
  if (filters?.category) {
    query = query.eq('category_id', filters.category);
  }

  // Apply search filter
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Apply tag filter using PostgreSQL array operators
  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  // Apply price range filter
  if (filters?.priceRange) {
    query = query
      .gte('price', filters.priceRange.min)
      .lte('price', filters.priceRange.max);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching marketplace items:', error);
    throw error;
  }

  return data || [];
};

export const searchMarketplaceByTags = async (tags: string[]): Promise<MarketplaceItem[]> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select(`
      *,
      category:marketplace_categories(name)
    `)
    .contains('tags', tags)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching marketplace by tags:', error);
    throw error;
  }

  return data || [];
};

export const getAvailableTags = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('marketplace_items')
    .select('tags')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching available tags:', error);
    throw error;
  }

  // Extract unique tags from all items
  const allTags = data?.flatMap(item => item.tags || []) || [];
  return Array.from(new Set(allTags)).sort();
};

/**
 * Fetch marketplace products with optional tag filtering
 */
export const fetchMarketplaceProducts = async (
  category?: string,
  searchQuery?: string,
  tags?: string[]
): Promise<MarketplaceProduct[]> => {
  try {
    let query = supabase
      .from('marketplace_products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim()) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    // Filter by tags (if provided)
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching marketplace products:', error);
      throw new Error(`Failed to fetch marketplace products: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in fetchMarketplaceProducts:', err);
    throw err;
  }
};

/**
 * Get unique tags from marketplace products
 */
export const getMarketplaceTags = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('tags')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching marketplace tags:', error);
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    // Extract unique tags from all products
    const allTags = new Set<string>();
    data?.forEach((product) => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach((tag: string) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  } catch (err) {
    console.error('Unexpected error in getMarketplaceTags:', err);
    throw err;
  }
};

/**
 * Get category counts including tag-based categorization
 */
export const getMarketplaceCategoryCounts = async (): Promise<{
  category: string;
  count: number;
}[]> => {
  try {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('category')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching category counts:', error);
      throw new Error(`Failed to fetch category counts: ${error.message}`);
    }

    // Count products per category
    const categoryCounts = data?.reduce((acc: { [key: string]: number }, product) => {
      const category = product.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(categoryCounts || {}).map(([category, count]) => ({
      category,
      count,
    }));
  } catch (err) {
    console.error('Unexpected error in getMarketplaceCategoryCounts:', err);
    throw err;
  }
};