import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isMobileMenuOpen: false,
  isCompanyDropdownOpen: false,
};

const navbarSlice = createSlice({
  name: "navbar",
  initialState,

  reducers: {
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    toggleCompanyDropdown: (state) => {
      state.isCompanyDropdownOpen =
        !state.isCompanyDropdownOpen;
    },

    closeNavbar: (state) => {
      state.isMobileMenuOpen = false;
      state.isCompanyDropdownOpen = false;
    },
  },
});

export const {
  toggleMobileMenu,
  toggleCompanyDropdown,
  closeNavbar,
} = navbarSlice.actions;

export default navbarSlice.reducer;