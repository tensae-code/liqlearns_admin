import React, { useState } from 'react';
import { StudentProfileDataService } from '../../../services/studentProfileDataService';
import studentProfileSample from '../../../data/studentProfileSample.json';

const StudentProfileDataPusher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    errors?: any[];
  } | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);

  const handlePushData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await StudentProfileDataService.pushStudentProfileData(
        'student@liqlearns.com',
        studentProfileSample
      );
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        message: 'Error pushing profile data',
        errors: [error],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    setLoading(true);

    try {
      const response = await StudentProfileDataService.fetchStudentProfileData(
        'student@liqlearns.com'
      );
      
      if (response.success && response.data) {
        setCurrentData(response.data);
      } else {
        setResult({
          success: false,
          message: response.message || 'Error fetching data',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error fetching profile data',
        errors: [error],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Student Profile Data Management
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Email: <span className="font-semibold">student@liqlearns.com</span>
        </p>
        <p className="text-gray-600 mb-4">
          This tool pushes the sample profile data to the database for the specified student.
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={handlePushData}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Push Profile Data'}
        </button>

        <button
          onClick={handleFetchData}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Loading...' : 'Fetch Current Data'}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start">
            <div className={`mr-3 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? 'Success' : 'Error'}
              </h3>
              <p className={`mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-red-700 font-semibold mb-2">Errors:</p>
                  <div className="bg-red-100 rounded p-3 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-red-800">
                      {JSON.stringify(result.errors, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Current Profile Data:</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Subscription Plan:</p>
              <p className="font-semibold text-gray-800">{currentData.profile.subscription_plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Level:</p>
              <p className="font-semibold text-gray-800">
                {currentData.profile.current_level} - {currentData.profile.level_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">XP:</p>
              <p className="font-semibold text-gray-800">{currentData.profile.xp}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gold:</p>
              <p className="font-semibold text-gray-800">{currentData.profile.gold}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aura Points:</p>
              <p className="font-semibold text-gray-800">{currentData.profile.aura_points}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Streak:</p>
              <p className="font-semibold text-gray-800">{currentData.profile.streak} days</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Recent Activities: {currentData.activities?.length || 0}</p>
            <p className="text-sm text-gray-600">Enrollments: {currentData.enrollments?.length || 0}</p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Sample Data Preview:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Profile: Subscription plan, XP, gold, aura points, streak, level info</p>
          <p>• Activities: {studentProfileSample.activities.length} purchase activity record(s)</p>
          <p>• Enrollments: {studentProfileSample.enrollments.length} course enrollment(s)</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileDataPusher;