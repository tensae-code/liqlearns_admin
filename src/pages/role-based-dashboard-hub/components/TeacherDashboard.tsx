import React, { useState, useEffect } from 'react';
import { BookOpen, Users, FileText, Award, Package, Upload, Edit3, Plus, Check, Share2, Calendar, BarChart3, Clock, Target, TrendingUp, UserCheck, BookMarked, Video, MessageCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface TeacherDashboardProps {
  activeSection?: string;
}

export default function TeacherDashboard({ activeSection = 'dashboard' }: TeacherDashboardProps) {
  const { user } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'ebook',
    permissions: {
      downloadable: true,
      printable: false,
      shareable: false,
      expiryDays: 0
    }
  });

  // NEW: Classes section
  const renderClassesSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-blue-600" />
              My Classes
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Create Class
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Amharic Beginners', students: 24, schedule: 'Mon, Wed, Fri 10:00 AM', progress: 65 },
              { name: 'Advanced Grammar', students: 18, schedule: 'Tue, Thu 2:00 PM', progress: 42 },
              { name: 'Conversation Practice', students: 15, schedule: 'Daily 4:00 PM', progress: 78 }
            ].map((cls, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-10 h-10 text-blue-600" />
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {cls.students} students
                  </span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{cls.name}</h4>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {cls.schedule}
                </p>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-700 mb-1">
                    <span>Progress</span>
                    <span className="font-bold">{cls.progress}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all" 
                      style={{ width: `${cls.progress}%` }}
                    ></div>
                  </div>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                  Manage Class
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h3>
          <div className="space-y-3">
            {[
              { class: 'Amharic Beginners', time: 'Today 10:00 AM', students: 24, type: 'Live Class' },
              { class: 'Advanced Grammar', time: 'Tomorrow 2:00 PM', students: 18, type: 'Workshop' },
              { class: 'Conversation Practice', time: 'Today 4:00 PM', students: 15, type: 'Practice Session' }
            ].map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{session.class}</h4>
                    <p className="text-sm text-gray-600">{session.time} • {session.students} students</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {session.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Students section
  const renderStudentsSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-green-600" />
              Student Management
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search students..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium">
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Classes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name: 'John Doe', classes: 'Amharic Beginners', progress: 78, lastActive: '2 hours ago' },
                  { name: 'Jane Smith', classes: 'Advanced Grammar', progress: 92, lastActive: '1 hour ago' },
                  { name: 'Mike Johnson', classes: 'Conversation Practice', progress: 65, lastActive: '5 hours ago' },
                  { name: 'Sarah Wilson', classes: 'Amharic Beginners', progress: 45, lastActive: '1 day ago' }
                ].map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold">{student.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.classes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{student.lastActive}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">42</span>
            </div>
            <p className="text-gray-700 font-medium">Total Students</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-8 h-8 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">38</span>
            </div>
            <p className="text-gray-700 font-medium">Active This Week</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">85%</span>
            </div>
            <p className="text-gray-700 font-medium">Avg Completion</p>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Content section
  const renderContentSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-7 h-7 text-orange-600" />
              Content Library
            </h3>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Upload className="w-4 h-4" />
              Upload Content
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button className="p-4 border-2 border-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <p className="text-sm font-medium text-orange-600">All Content</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">28</p>
            </button>
            <button className="p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">Videos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </button>
            <button className="p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">10</p>
            </button>
            <button className="p-4 border-2 border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-gray-600">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
            </button>
          </div>

          <div className="space-y-4">
            {[
              { title: 'Introduction to Amharic Alphabet', type: 'Video', duration: '45 min', views: 156 },
              { title: 'Grammar Rules Chapter 3', type: 'Document', pages: '24 pages', downloads: 89 },
              { title: 'Pronunciation Practice Quiz', type: 'Quiz', questions: '20 questions', completed: 42 },
              { title: 'Cultural Context Lesson', type: 'Video', duration: '30 min', views: 124 }
            ].map((content, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
                    {content.type === 'Video' && <Video className="w-7 h-7 text-orange-600" />}
                    {content.type === 'Document' && <FileText className="w-7 h-7 text-orange-600" />}
                    {content.type === 'Quiz' && <Target className="w-7 h-7 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{content.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">{content.type}</span>
                      <span>{content.type === 'Video' ? content.duration : content.type === 'Document' ? content.pages : content.questions}</span>
                      <span>•</span>
                      <span>{content.type === 'Video' ? `${content.views} views` : content.type === 'Document' ? `${content.downloads} downloads` : `${content.completed} completed`}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium">
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Reports section
  const renderReportsSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-600" />
              Performance Reports
            </h3>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-600" />
                <span className="text-xs font-bold text-blue-600">+12%</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">89%</p>
              <p className="text-sm text-blue-700 mt-1">Avg Class Performance</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-8 h-8 text-green-600" />
                <span className="text-xs font-bold text-green-600">+8%</span>
              </div>
              <p className="text-3xl font-bold text-green-900">94%</p>
              <p className="text-sm text-green-700 mt-1">Attendance Rate</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-purple-600" />
                <span className="text-xs font-bold text-purple-600">+15%</span>
              </div>
              <p className="text-3xl font-bold text-purple-900">76%</p>
              <p className="text-sm text-purple-700 mt-1">Assignment Completion</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-orange-600" />
                <span className="text-xs font-bold text-orange-600">+5%</span>
              </div>
              <p className="text-3xl font-bold text-orange-900">4.8</p>
              <p className="text-sm text-orange-700 mt-1">Student Satisfaction</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Class Performance Breakdown</h4>
            <div className="space-y-4">
              {[
                { class: 'Amharic Beginners', students: 24, avgScore: 85, completion: 92, satisfaction: 4.7 },
                { class: 'Advanced Grammar', students: 18, avgScore: 91, completion: 88, satisfaction: 4.9 },
                { class: 'Conversation Practice', students: 15, avgScore: 88, completion: 95, satisfaction: 4.8 }
              ].map((report, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-gray-900">{report.class}</h5>
                    <span className="text-sm text-gray-600">{report.students} students</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Avg Score</p>
                      <p className="text-xl font-bold text-indigo-600">{report.avgScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Completion</p>
                      <p className="text-xl font-bold text-green-600">{report.completion}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Satisfaction</p>
                      <p className="text-xl font-bold text-orange-600">{report.satisfaction}/5</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Schedule section
  const renderScheduleSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-teal-600" />
              Teaching Schedule
            </h3>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Session
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center py-2 font-bold text-gray-700">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`aspect-square border border-gray-200 rounded-lg p-2 ${
                  idx % 7 === 3 || idx % 7 === 5 ? 'bg-teal-50 border-teal-300' : 'bg-white'
                } hover:bg-teal-100 transition-colors cursor-pointer`}
              >
                <p className="text-sm font-medium text-gray-900">{(idx % 30) + 1}</p>
                {(idx % 7 === 3 || idx % 7 === 5) && (
                  <div className="mt-1">
                    <div className="h-1 bg-teal-600 rounded mb-1"></div>
                    <p className="text-xs text-teal-900 font-medium truncate">Class</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">This Week's Sessions</h4>
            <div className="space-y-3">
              {[
                { class: 'Amharic Beginners', day: 'Monday', time: '10:00 AM - 11:30 AM', room: 'Virtual Room A' },
                { class: 'Advanced Grammar', day: 'Tuesday', time: '2:00 PM - 3:30 PM', room: 'Virtual Room B' },
                { class: 'Conversation Practice', day: 'Wednesday', time: '4:00 PM - 5:00 PM', room: 'Virtual Room C' },
                { class: 'Amharic Beginners', day: 'Friday', time: '10:00 AM - 11:30 AM', room: 'Virtual Room A' }
              ].map((session, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-teal-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900">{session.class}</h5>
                      <p className="text-sm text-gray-600">{session.day} • {session.time}</p>
                      <p className="text-xs text-gray-500">{session.room}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NEW: Help section
  const renderHelpSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-7 h-7 text-blue-600" />
              Help & Support
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
              <BookMarked className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="text-lg font-bold text-blue-900 mb-2">Getting Started Guide</h4>
              <p className="text-sm text-blue-700 mb-4">Learn the basics of teaching on our platform</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                View Guide
              </button>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
              <Video className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-lg font-bold text-green-900 mb-2">Video Tutorials</h4>
              <p className="text-sm text-green-700 mb-4">Watch step-by-step video guides</p>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Watch Videos
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h4>
            <div className="space-y-3">
              {[
                { q: 'How do I create a new class?', a: 'Go to My Classes and click the "Create Class" button.' },
                { q: 'How can I upload course materials?', a: 'Navigate to Content Library and use the "Upload Content" button.' },
                { q: 'How do I track student progress?', a: 'Visit the Reports section for detailed performance analytics.' },
                { q: 'Can I schedule recurring classes?', a: 'Yes, use the Schedule section to set up recurring sessions.' }
              ].map((faq, idx) => (
                <details key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <summary className="font-medium text-gray-900 cursor-pointer hover:text-blue-600">
                    {faq.q}
                  </summary>
                  <p className="text-sm text-gray-600 mt-2 pl-4">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <MessageCircle className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-lg font-bold text-blue-900 mb-2">Still Need Help?</h4>
                <p className="text-sm text-blue-700 mb-4">Our support team is here to assist you 24/7</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStoreSection = () => {
    return (
      <div className="space-y-6">
        {/* My Storefront Overview */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-purple-100 text-sm mb-1">My Storefront</p>
              <h2 className="text-3xl font-bold">Active</h2>
            </div>
            <Package className="w-12 h-12 text-purple-200" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">Total Products</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">Total Sales</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-purple-100 text-xs mb-1">This Month</p>
              <p className="text-2xl font-bold">$520</p>
            </div>
          </div>
        </div>

        {/* Upload Material Tool */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-purple-600" />
              Upload Material for Sale
            </h3>
            {!showUploadForm && (
              <button 
                onClick={() => setShowUploadForm(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Material
              </button>
            )}
          </div>

          {showUploadForm ? (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  placeholder="e.g., Advanced Amharic Grammar Guide"
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Describe your material..."
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (USD) *</label>
                  <input
                    type="number"
                    value={uploadData.price}
                    onChange={(e) => setUploadData({...uploadData, price: e.target.value})}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ebook">E-Book</option>
                    <option value="video">Video Course</option>
                    <option value="audio">Audio Lesson</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="guide">Study Guide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions & Access</label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <Check className="w-4 h-4" />
                      Downloadable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.downloadable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, downloadable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <FileText className="w-4 h-4" />
                      Printable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.printable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, printable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-gray-700">
                      <Share2 className="w-4 h-4" />
                      Shareable
                    </span>
                    <input
                      type="checkbox"
                      checked={uploadData.permissions.shareable}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, shareable: e.target.checked}
                      })}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                  </label>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Access Expiry (days, 0 = unlimited)</label>
                    <input
                      type="number"
                      value={uploadData.permissions.expiryDays}
                      onChange={(e) => setUploadData({
                        ...uploadData,
                        permissions: {...uploadData.permissions, expiryDays: parseInt(e.target.value) || 0}
                      })}
                      min="0"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Upload & Publish
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 text-center py-8">
              Click "New Material" to upload content for sale
            </p>
          )}
        </div>

        {/* Manage Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-purple-600" />
              Manage Products
            </h3>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Amharic Study Guide', price: '$29.99', inventory: 15, sales: 23 },
              { name: 'Ethiopian Culture eBook', price: '$19.99', inventory: 8, sales: 12 },
              { name: 'Language Flashcards Set', price: '$15.00', inventory: 20, sales: 10 }
            ].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>Price: <strong className="text-gray-900">{product.price}</strong></span>
                      <span>Stock: <strong className="text-gray-900">{product.inventory}</strong></span>
                      <span>Sales: <strong className="text-green-600">{product.sales}</strong></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Analytics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Sales Analytics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">$1,248</p>
              <p className="text-xs text-green-600 mt-1">+18% this month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Units Sold</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-xs text-green-600 mt-1">+12% this month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-600 mb-2">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">$27.73</p>
              <p className="text-xs text-gray-600 mt-1">Stable</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboardSection = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-3xl font-bold text-gray-900">42</span>
            </div>
            <p className="text-gray-700 font-medium">Total Students</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-green-500" />
              <span className="text-3xl font-bold text-gray-900">8</span>
            </div>
            <p className="text-gray-700 font-medium">Active Classes</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-gray-900">156</span>
            </div>
            <p className="text-gray-700 font-medium">Assignments Graded</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New assignment submitted</p>
                <p className="text-sm text-gray-600">John Doe - Mathematics Class</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Class scheduled</p>
                <p className="text-sm text-gray-600">Amharic Advanced - Tomorrow 2PM</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Welcome header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'Teacher'}! 👋
        </h1>
        <p className="text-gray-600">Manage your classes and students</p>
      </div>

      {/* Content area - render based on activeSection */}
      {activeSection === 'dashboard' && renderDashboardSection()}
      {activeSection === 'classes' && renderClassesSection()}
      {activeSection === 'students' && renderStudentsSection()}
      {activeSection === 'content' && renderContentSection()}
      {activeSection === 'reports' && renderReportsSection()}
      {activeSection === 'schedule' && renderScheduleSection()}
      {activeSection === 'store' && renderStoreSection()}
      {activeSection === 'help' && renderHelpSection()}
    </div>
  );
}