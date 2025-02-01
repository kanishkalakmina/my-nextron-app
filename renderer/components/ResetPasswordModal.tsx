import React from "react";
import { KeyIcon } from "@heroicons/react/24/outline";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  adminPassword: string;
  newPassword: string;
  confirmPassword: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  adminPassword,
  newPassword,
  confirmPassword,
  onInputChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Modal backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <KeyIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  Reset Password
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Please enter your admin password and the new password for the user.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-4 pb-4 sm:px-6">
            <div className="space-y-4">
              {/* Admin Password */}
              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Admin Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="adminPassword"
                    name="adminPassword"
                    value={adminPassword}
                    onChange={onInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    placeholder="Enter admin password"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={onInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={onInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-row-reverse gap-3">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
