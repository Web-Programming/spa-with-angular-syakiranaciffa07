import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LokasiPerumahan } from '../lokasi-perumahan/lokasi-perumahan';
import { Housing } from '../lokasi-perumahan/housing-model';
import { CommonModule } from '@angular/common';
import { HOUSING_DATA } from '../data/housing-data';
import { HousingService } from '../services/services';
import { FormsModule } from '@angular/forms';  // ← Untuk search

@Component({
  selector: 'app-home',
  imports: [LokasiPerumahan, CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  // Array untuk data perumahan (bisa diisi dari backend nanti)
  housingList: Housing[] = HOUSING_DATA;
  filteredList: Housing[] = [];

  // State management
  isLoading: boolean = false;         // Loading state
  errorMessage: string = '';          // Error message
  selectedFilter: string = 'all';     // Filter aktif

  // Pagination
  currentPage: number = 1;            // Halaman saat ini
  itemsPerPage: number = 6;           // Items per halaman

  // Search functionality
  searchQuery: string = '';
  
  private fallbackData: Housing[] = HOUSING_DATA; // Data fallback jika terjadi error
  constructor(private housingService: HousingService) { }

  ngOnInit() {
    // dia akan mengisi semua data aslinya
    // Initialize filtered list with all housing
    // this.filteredList = [...this.housingList];
    this.loadHousingData();
  }

  loadHousingData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.housingService.getAllHousing().subscribe({
      next: (data) => {
        this.housingList = data;
        this.filteredList = data;
        this.isLoading = false;
        console.log('Data berhasil dimuat dari backend:', data);
      },
      error: (err) => {
        console.error('Error loading housing data:', err);
        // Gunakan data fallback
        this.housingList = this.fallbackData;
        this.filteredList = this.fallbackData;
        this.isLoading = false;
        this.errorMessage = 'Menggunakan data demo (backend tidak tersedia)';
      }
    });
  }

  filterByType(type: string) {
  this.selectedFilter = type;
  this.currentPage = 1; // Reset ke halaman pertama
  this.isLoading = true;
  this.errorMessage = '';
  
  if (type === 'all') {
    // Load semua data dari backend
    this.housingService.getAllHousing().subscribe({
      next: (data) => {
        this.housingList = data;
        this.filteredList = data;
        this.isLoading = false;
        
        // Terapkan search jika ada query
        if (this.searchQuery) {
          this.applySearch();
        }
      },
      error: (err) => {
        console.error('Error loading all housing data:', err);
        // Fallback ke filter lokal
        this.filteredList = [...this.housingList];
        this.isLoading = false;
        
        // Terapkan search jika ada query
        if (this.searchQuery) {
          this.applySearch();
        }
      }
    });
  } else {
    // Filter berdasarkan type dari backend
    this.housingService.filterHousingByType(type).subscribe({
      next: (data) => {
        this.filteredList = data;
        this.isLoading = false;
        
        // Terapkan search jika ada query
        if (this.searchQuery) {
          this.applySearch();
        }
      },
      error: (err) => {
        console.error('Error filtering housing by type:', err);
        // Fallback ke filter lokal
        this.filteredList = this.housingList.filter(h => h.type === type);
        this.isLoading = false;
        
        // Terapkan search jika ada query
        if (this.searchQuery) {
          this.applySearch();
        }
      }
    });
  }
}

  isFilterActive(type: string): boolean {
    return this.selectedFilter === type;
  }

  // Computed property untuk data yang ditampilkan (paginated)
  get paginatedList(): Housing[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredList.slice(start, start + this.itemsPerPage);
  }

  // Total halaman
  get totalPages(): number {
    return Math.ceil(this.filteredList.length / this.itemsPerPage);
  }

  // Array untuk loop pagination buttons
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Index awal item di halaman ini
  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  // Index akhir item di halaman ini
  get endIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredList.length);
  }
  // Pindah ke halaman tertentu
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Smooth scroll ke section
      document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Halaman berikutnya
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Halaman sebelumnya
  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  // Method yang dipanggil saat user mengetik
  searchHousing() {
    this.currentPage = 1; // Reset ke halaman pertama
    this.applySearch();
  }

  // Logic search sebenarnya
  private applySearch() {
    const query = this.searchQuery.toLowerCase().trim();

    // Jika search kosong, kembalikan ke filter saat ini
    if (!query) {
      this.filterByType(this.selectedFilter);
      return;
    }

    // Base list berdasarkan filter
    let baseList = this.selectedFilter === 'all'
      ? this.housingList
      : this.housingList.filter(h => h.type === this.selectedFilter);

    // Apply search pada base list
    this.filteredList = baseList.filter(house =>
      house.title.toLowerCase().includes(query) ||
      house.location.toLowerCase().includes(query) ||
      house.description?.toLowerCase().includes(query) ||
      house.status.toLowerCase().includes(query)
    );
  }

  // Clear search
  clearSearch() {
    this.searchQuery = '';
    this.filterByType(this.selectedFilter);
  }
}