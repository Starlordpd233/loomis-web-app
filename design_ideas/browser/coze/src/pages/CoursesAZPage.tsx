import React from 'react';

// 课程数据类型定义
interface Course {
  name: string;
  code: string;
}

// 字母导航数据
const alphabet = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// 课程数据 - 模拟数据
const courseData: Record<string, Course[]> = {
  'A': [
    { name: 'African Studies', code: 'AFST' },
    { name: 'American Studies', code: 'AMER_ST' },
    { name: 'Anthropology', code: 'ANTHRO' },
    { name: 'Arabic', code: 'ARABIC' },
    { name: 'Art History', code: 'ART_HIST' },
    { name: 'Art Theory & Practice', code: 'ART' },
    { name: 'Asian American Studies', code: 'ASIAN_AM' },
  ],
  // 这里可以添加其他字母的课程数据
};

const CoursesAZPage: React.FC = () => {
  // 激活的字母状态
  const [activeLetter, setActiveLetter] = React.useState('A');
  
  // 侧边栏导航项
  const sidebarItems = [
    'Privacy & Disclosures',
    'Admission',
    'Financial Aid',
    'Tuition & Payment',
    'Courses A-Z',
    'Programs A-Z',
    'Requirements and Policies',
    'Additional Baccalaureate Options',
    'Dual Graduate & Undergraduate Degrees',
    'Dual Bachelor\'s Degrees',
    'Study Outside Northwestern',
  ];
  
  // 主导航项
  const mainNavItems = [
    { name: 'Home', active: false },
    { name: 'Undergraduate', active: true },
    { name: 'Graduate/Professional', active: false },
    { name: 'Archives', active: false },
    { name: 'Print Options', active: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部紫色标题栏 */}
      <header className="bg-purple-900 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Northwestern</h1>
            <h2 className="text-xl font-semibold mt-1">ACADEMIC CATALOG</h2>
            <p className="text-sm">2025-2026 Edition</p>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search this site"
              className="py-2 px-3 rounded-md border-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 w-64"
            />
            <button className="ml-2 p-2 bg-white text-purple-900 rounded-md hover:bg-purple-100 transition-colors">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 主导航栏 */}
      <nav className="bg-gray-100 border-b border-gray-300">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-1">
            {mainNavItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={`py-2 px-4 inline-block ${
                    item.active
                      ? 'bg-purple-900 text-white'
                      : 'text-gray-800 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap">
          {/* 左侧侧边栏 */}
          <aside className="w-full md:w-1/5 lg:w-1/6 pr-0 md:pr-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-900 border-b border-gray-200 pb-2">
              Undergraduate
            </h3>
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className={`block py-1 text-purple-900 hover:text-purple-700 transition-colors ${
                      item === 'Courses A-Z' ? 'font-semibold' : ''
                    }`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* 右侧内容区域 */}
          <div className="w-full md:w-4/5 lg:w-5/6 mt-6 md:mt-0">
            {/* 面包屑导航 */}
            <div className="text-sm text-gray-600 mb-4">
              <a href="#" className="hover:text-purple-900 transition-colors">HOME</a> &gt;{' '}
              <a href="#" className="hover:text-purple-900 transition-colors">UNDERGRADUATE</a> &gt;{' '}
              <span className="font-medium">COURSES A-Z</span>
            </div>

            {/* 页面标题 */}
            <h1 className="text-3xl font-bold text-purple-900 mb-6">Courses A-Z</h1>

            {/* 字母导航 */}
            <div className="flex flex-wrap gap-2 mb-8">
              {alphabet.map((letter) => {
                const isActive = ['A', 'W', 'X', 'Y', 'Z'].includes(letter);
                return (
                  <a
                    key={letter}
                    href={`#${letter}`}
                    className={`py-1 px-3 rounded ${
                      isActive
                        ? 'bg-purple-900 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } transition-colors text-sm font-medium`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveLetter(letter);
                    }}
                  >
                    {letter}
                  </a>
                );
              })}
            </div>

            {/* 课程列表 */}
            <div id={activeLetter} className="mb-12">
              <h2 className="text-2xl font-bold text-purple-900 mb-4">{activeLetter}</h2>
              <ul className="space-y-2">
                {(courseData[activeLetter] || []).map((course, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="flex items-start hover:text-purple-900 transition-colors"
                    >
                      <span className="mr-2">•</span>
                      <span>{course.name} ({course.code})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursesAZPage;