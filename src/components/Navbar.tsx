// src/components/Navbar.tsx
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // NavLinkProps tidak perlu diimpor jika kita menyederhanakan
import { useAuth } from "../utils/AuthProvider";

const navigation = [
  { name: "Home", to: "/", current: false },
  { name: "Data Mahasiswa", to: "/data-mahasiswa", current: false },
  { name: "Post", to: "/postings", current: false },
  { name: "Recipes", to: "/recipes", current: false },
  { name: "Note", to: "/note", current: false },
];

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

// Definisikan tipe untuk parameter fungsi className
interface NavLinkRenderArgs {
  isActive: boolean;
  isPending: boolean;
  isTransitioning?: boolean; // isTransitioning adalah opsional
}

// Komponen MobileNavLink (tidak ada perubahan, ini sudah benar dari sebelumnya)
const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to + "/"));

  return (
    <NavLink
      to={to}
      className={classNames(
        isActive ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white',
        'block rounded-md px-3 py-2 text-base font-medium transition-colors'
      )}
      aria-current={isActive ? "page" : undefined} // Ini sudah benar untuk NavLink biasa
    >
      {children}
    </NavLink>
  );
};


const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Disclosure as="nav" className="bg-blue-700 shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo dan Navigasi Utama (Kiri) */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <NavLink to="/" className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-lg hidden sm:block">
                      Portal MHS
                    </span>
                  </NavLink>
                </div>
                <div className="hidden sm:ml-8 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive, isPending }: NavLinkRenderArgs) =>
                          classNames(
                            isActive
                              ? "bg-blue-800 text-white"
                              : "text-blue-100 hover:bg-blue-600 hover:text-white",
                            isPending ? "opacity-50 cursor-wait" : "",
                            "rounded-md px-3 py-2 text-sm font-medium transition-colors"
                          )
                        }
                        // Hapus prop aria-current di sini.
                        // NavLink akan otomatis mengaturnya berdasarkan isActive.
                        // aria-current={({ isActive }: { isActive: boolean }) =>
                        //   isActive ? "page" : undefined
                        // }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tombol Notifikasi dan Profil (Kanan) */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {isAuthenticated && user ? (
                  <>
                    <button
                      type="button"
                      className="relative rounded-full bg-blue-700 p-1 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                    </button>

                    <Menu as="div" className="relative ml-4">
                      <div>
                        <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700">
                          <span className="sr-only">Open user menu</span>
                          {user.username ? (
                             <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                                <span className="text-sm font-medium leading-none text-white">
                                  {user.username.substring(0, 2).toUpperCase()}
                                </span>
                              </span>
                          ) : (
                            <UserCircleIcon className="h-8 w-8 rounded-full text-blue-200" />
                          )}
                        </MenuButton>
                      </div>
                      <MenuItems
                        transition
                        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                      >
                        <div className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="border-t border-gray-200"></div>
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <NavLink
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                              // aria-current di sini juga akan otomatis ditangani jika ini NavLink
                              // Jika ini adalah link biasa, maka Anda harus set manual jika perlu
                            >
                              Profil Anda
                            </NavLink>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <NavLink
                              to="/settings"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Pengaturan
                            </NavLink>
                          )}
                        </MenuItem>
                        <MenuItem>
                          {({ active }: { active: boolean }) => (
                            <button
                              onClick={handleLogout}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full px-4 py-2 text-left text-sm text-gray-700'
                              )}
                            >
                              Keluar
                            </button>
                          )}
                        </MenuItem>
                      </MenuItems>
                    </Menu>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className="text-blue-100 hover:bg-blue-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Login
                  </NavLink>
                )}
              </div>

              {/* Tombol Menu Mobile */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-blue-200 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
            </div>
          </div>

          {/* Panel Menu Mobile */}
          <DisclosurePanel className="sm:hidden bg-blue-700 border-t border-blue-600">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <MobileNavLink key={item.name} to={item.to}>
                  {item.name}
                </MobileNavLink>
              ))}
            </div>
            {isAuthenticated && user && (
                <div className="border-t border-blue-600 pt-4 pb-3">
                    <div className="flex items-center px-5">
                        <div className="flex-shrink-0">
                             {user.username ? (
                                 <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                                    <span className="text-base font-medium leading-none text-white">
                                      {user.username.substring(0, 2).toUpperCase()}
                                    </span>
                                  </span>
                              ) : (
                                <UserCircleIcon className="h-10 w-10 rounded-full text-blue-200" />
                              )}
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium text-white">{user.username}</div>
                            <div className="text-sm font-medium text-blue-300">{user.email}</div>
                        </div>
                        <button
                            type="button"
                            className="relative ml-auto flex-shrink-0 rounded-full bg-blue-700 p-1 text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                        >
                            <span className="sr-only">View notifications</span>
                            <BellIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-3 space-y-1 px-2">
                        <DisclosureButton
                            as={NavLink}
                            to="/profile"
                            className="block rounded-md px-3 py-2 text-base font-medium text-blue-100 hover:bg-blue-600 hover:text-white"
                        >
                            Profil Anda
                        </DisclosureButton>
                         <DisclosureButton
                            as={NavLink}
                            to="/settings"
                            className="block rounded-md px-3 py-2 text-base font-medium text-blue-100 hover:bg-blue-600 hover:text-white"
                        >
                            Pengaturan
                        </DisclosureButton>
                        <DisclosureButton
                            as="button"
                            onClick={handleLogout}
                            className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-blue-100 hover:bg-blue-600 hover:text-white"
                        >
                            Keluar
                        </DisclosureButton>
                    </div>
                </div>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
