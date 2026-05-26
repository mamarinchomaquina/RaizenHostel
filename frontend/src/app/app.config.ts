import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LUCIDE_ICONS, LucideIconProvider, icons, Home, BarChart2, Grid, LayoutDashboard, Mail, FileText, Shield, ShieldCheck, MailOpen, Inbox, Bed, Users, LogIn, LogOut, Moon, X, CreditCard, Loader, ChevronLeft, ChevronRight, Calendar, Info, CheckCircle, AlertCircle, User, Settings, Image as ImageIcon, BedSingle, BedDouble, Images, Maximize2, WifiOff, TriangleAlert, Ban, Check, DoorOpen, DoorClosed, Receipt, MessageSquare, Instagram, Facebook } from 'lucide-angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const customIcons = { 
  ...icons, 
  Home, BarChart2, Grid, LayoutDashboard, Mail, FileText, Shield, ShieldCheck, 
  MailOpen, Inbox, Bed, Users, LogIn, LogOut, Moon, X, CreditCard, Loader, 
  ChevronLeft, ChevronRight, Calendar, Info, CheckCircle, AlertCircle, User, 
  Settings, ImageIcon, BedSingle, BedDouble, Images, Maximize2, WifiOff, 
  TriangleAlert, Ban, Check, DoorOpen, DoorClosed, Receipt, MessageSquare,
  Instagram, Facebook
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: LUCIDE_ICONS, multi: true, useValue: new LucideIconProvider(customIcons) },
  ]
};
