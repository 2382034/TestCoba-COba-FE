import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthProvider'; // Untuk personalisasi sambutan
import { AcademicCapIcon, CalendarDaysIcon, DocumentTextIcon, UsersIcon, InformationCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'; // Ikon yang relevan

// --- Placeholder Data (Ganti dengan data asli dari API/state Anda) ---
const latestAnnouncements = [
  { id: '1', title: 'Jadwal Ujian Akhir Semester Genap 2023/2024', date: '2024-05-15', excerpt: 'Lihat detail jadwal dan ruangan untuk UAS semester ini.' , link: '/pengumuman/1'},
  { id: '2', title: 'Pendaftaran Beasiswa Prestasi Dibuka', date: '2024-05-10', excerpt: 'Kesempatan mendapatkan beasiswa bagi mahasiswa berprestasi.', link: '/pengumuman/2' },
  { id: '3', title: 'Workshop Pengembangan Karir Mahasiswa', date: '2024-05-05', excerpt: 'Ikuti workshop untuk mempersiapkan diri memasuki dunia kerja.', link: '/pengumuman/3' },
];

const quickAccessLinks = [
  { name: 'Data Pribadi Mahasiswa', to: '/data-mahasiswa', icon: UsersIcon, description: 'Lihat dan kelola data pribadi Anda.' },
  { name: 'Jadwal Kuliah & Ujian', to: '/jadwal', icon: CalendarDaysIcon, description: 'Akses jadwal perkuliahan dan ujian semester.' },
  { name: 'Transkrip Nilai', to: '/transkrip', icon: DocumentTextIcon, description: 'Cek dan unduh transkrip nilai akademik.' },
  { name: 'Info Akademik', to: '/info-akademik', icon: InformationCircleIcon, description: 'Informasi penting seputar kegiatan akademik.' },
];
// --- End Placeholder Data ---

// --- Komponen Card untuk Pengumuman (bisa dibuat file terpisah) ---
interface AnnouncementCardProps {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  link: string;
}
const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ title, date, excerpt, link }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
    <p className="text-sm text-gray-500 mb-1">{new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <h3 className="text-xl font-semibold mb-2 text-blue-700">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{excerpt}</p>
    <Link to={link} className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
      Baca Selengkapnya <ArrowRightIcon className="ml-1 h-4 w-4" />
    </Link>
  </div>
);

// --- Komponen Card untuk Akses Cepat (bisa dibuat file terpisah) ---
interface QuickAccessCardProps {
  name: string;
  to: string;
  icon: React.ElementType; // Menerima komponen ikon
  description: string;
}
const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ name, to, icon: Icon, description }) => (
  <Link to={to} className="block bg-gradient-to-br from-blue-50 to-sky-100 p-6 rounded-lg shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-blue-200">
    <div className="flex items-center mb-3">
      <Icon className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
      <h3 className="text-lg font-semibold text-blue-800">{name}</h3>
    </div>
    <p className="text-sm text-gray-700">{description}</p>
  </Link>
);


const Home = () => {
  const { user } = useAuth(); // Mengambil data user jika sudah login

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero Section */}
      <section className="mb-12 p-8 md:p-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                Selamat Datang, {user?.username || 'Mahasiswa'}!
                </h1>
                <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl">
                Portal Mahasiswa ini adalah pusat informasi dan layanan akademik Anda.
                </p>
                 <Link
                    to="/data-mahasiswa" // Arahkan ke halaman utama yang relevan
                    className="inline-flex items-center bg-white text-blue-700 font-semibold rounded-lg py-3 px-6 hover:bg-blue-50 transition-colors shadow-md text-base"
                >
                    Lihat Data Anda
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
            </div>
            <div className="hidden md:block">
                <AcademicCapIcon className="h-32 w-32 lg:h-40 lg:w-40 text-blue-400 opacity-80" />
            </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessLinks.map((item) => (
            <QuickAccessCard
              key={item.name}
              name={item.name}
              to={item.to}
              icon={item.icon}
              description={item.description}
            />
          ))}
        </div>
      </section>

      {/* Latest Announcements Section */}
      <section className="mb-12">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Pengumuman Terbaru</h2>
        {latestAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                id={announcement.id}
                title={announcement.title}
                date={announcement.date}
                excerpt={announcement.excerpt}
                link={announcement.link}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Tidak ada pengumuman terbaru saat ini.</p>
          </div>
        )}
        <div className="text-center mt-8">
            <Link to="/pengumuman" className="text-blue-600 hover:text-blue-800 font-medium">
              Lihat Semua Pengumuman →
            </Link>
        </div>
      </section>

      {/* Optional: Bagian lain seperti Kalender Akademik, Link Eksternal, dll. */}
      {/*
      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-800">Link Terkait</h2>
        <div className="flex flex-wrap justify-start gap-4">
          <a href="#" className="text-blue-600 hover:underline">Perpustakaan</a>
          <a href="#" className="text-blue-600 hover:underline">Sistem Informasi Akademik</a>
          <a href="#" className="text-blue-600 hover:underline">Platform E-Learning</a>
        </div>
      </section>
      */}

    </div>
  );
};

export default Home;