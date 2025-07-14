import { productsApi } from './products.api';
import { categoriesApi } from './categories.api';
import { brandsApi } from './brands.api';
import { collectionsApi } from './collections.api';

export const catalogApi = {
    products: productsApi,
    categories: categoriesApi,
    brands: brandsApi,
    collections: collectionsApi
};

export default catalogApi;