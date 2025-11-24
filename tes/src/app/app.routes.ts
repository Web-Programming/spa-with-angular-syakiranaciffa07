import { Routes } from '@angular/router';
import { Home as HomeComponent } from './home/home';
import { Contact } from './contact/contact';
import { Register } from './register/register';
import { Profile } from './profile/profile';
import { Login } from './login/login';

export const routes: Routes = [
    //mengatur halaman utama aplikasi
    {
        path : "",
        component : HomeComponent, 
        title : 'Home Page'
    },
     {
        path : "profile",
        component : Profile, 
        title : 'Profile Page'
    },
     {
        path : "login",
        component : Login
    },
     {
        path : "register",
        component : Register, 
    },
 {
        path : "contact",
        component : Contact, 
    }
];
