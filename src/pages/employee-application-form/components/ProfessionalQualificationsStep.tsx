import React from 'react';
import { Upload, FileText, X } from 'lucide-react';
import Input from '../../../components/ui/Input';


interface ProfessionalQualificationsStepProps {
  formData: {
    resume?: File | null;
    coverLetter?: string;
    certifications?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const ProfessionalQualificationsStep: React.FC<ProfessionalQualificationsStepProps> = ({ formData, onChange }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      onChange('resume', file);
    }
  };

  const removeFile = () => {
    onChange('resume', null);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional Qualifications</h3>
        <p className="text-gray-600">Upload your credentials and supporting documents</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Resume/CV <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">PDF, DOC, or DOCX format (Max 5MB)</p>
        
        {!formData.resume ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{formData.resume.name}</p>
                <p className="text-xs text-gray-500">{(formData.resume.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter <span className="text-gray-400">(Optional)</span>
        </label>
        <textarea
          value={formData.coverLetter || ''}
          onChange={(e) => onChange('coverLetter', e.target.value)}
          placeholder="Tell us why you're interested in this role and what makes you a great fit..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          {(formData.coverLetter || '').length} / 1000 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Certifications <span className="text-gray-400">(Optional)</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          List any relevant certifications or professional qualifications
        </p>
        <Input
          type="text"
          placeholder="e.g., AWS Certified Solutions Architect, PMP, etc."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                onChange('certifications', [...(formData.certifications || []), value]);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
        <p className="text-xs text-gray-500 mt-2">Press Enter to add certification</p>

        {formData.certifications && formData.certifications.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-xl text-sm"
              >
                <span>{cert}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newCerts = formData.certifications?.filter((_, i) => i !== index);
                    onChange('certifications', newCerts);
                  }}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalQualificationsStep;