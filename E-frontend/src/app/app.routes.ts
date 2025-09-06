import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderDetailComponent } from './pages/order-detail/order-detail.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminProductFormComponent } from './pages/admin/product-form/product-form.component';
import { AdminOrdersComponent } from './pages/admin/orders/admin-orders.component';
import { AdminGuard } from './guards/admin.guard';
import { TestimonialsComponent } from './pages/testimonials/testimonials.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AdminCategoriesComponent } from './pages/admin/categories/admin-categories.component';
import { AdminUsersComponent } from './pages/admin/users/admin-users.component';
import { AdminTestimonialsComponent } from './pages/admin/testimonials/admin-testimonials.component';
import { AdminContactMessagesComponent } from './pages/admin/contact-messages/admin-contact-messages.component';
import { CategoryFormComponent } from './pages/admin/categories/category-form.component';
import { AdminUserFormComponent } from './pages/admin/users/admin-user-form.component';
import { ReportsComponent } from './pages/admin/reports/reports.component';

export const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
  { path: 'orders/:id', component: OrderDetailComponent, canActivate: [authGuard] },
  { path: 'testimonials', component: TestimonialsComponent },
  { path: 'contact', component: ContactComponent },

  { path: 'admin/products', component: AdminProductsComponent, canActivate: [AdminGuard] },
  { path: 'admin/products/new', component: AdminProductFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/products/:id/edit', component: AdminProductFormComponent, canActivate: [AdminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AdminGuard] },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate:[AdminGuard] },
  { path: 'admin/categories/:id/edit', component: CategoryFormComponent, canActivate:[AdminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate:[AdminGuard] },
  { path: 'admin/users/:id/edit', component: AdminUserFormComponent, canActivate:[AdminGuard] },
  { path: 'admin/reports', component: ReportsComponent, canActivate:[AdminGuard] },

  { path: 'admin/testimonials', component: AdminTestimonialsComponent, canActivate:[AdminGuard] },
  { path: 'admin/contact', component: AdminContactMessagesComponent, canActivate:[AdminGuard] },
  { path: '**', redirectTo: '' }
];
