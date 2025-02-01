import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { hasPageAccess } from '../../utils/roleAccess';
import { Pages, PageValue, PageRoutes } from '../../utils/pages';

export function withRoleAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPage: PageValue
) {
  return function WithRoleAccessWrapper(props: P) {
    const router = useRouter();
    
    useEffect(() => {
      const userRole = localStorage.getItem('userRole');
      
      if (!userRole || !hasPageAccess(userRole, requiredPage)) {
        router.replace(PageRoutes[Pages.DASHBOARD]);
      }
    }, [router]);

    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    
    if (!userRole || !hasPageAccess(userRole, requiredPage)) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
