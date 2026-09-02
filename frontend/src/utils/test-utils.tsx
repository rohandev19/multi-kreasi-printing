import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastContext';
import { RoleContext } from '../contexts/RoleContext';
import type { RoleContextType, UserRole } from '../contexts/RoleContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  roleValue?: Partial<RoleContextType>;
}

const defaultRoleValue: RoleContextType = {
  role: 'User' as UserRole,
  user: { id: '1', email: 'test@example.com', role: 'User' as UserRole, fullName: 'Test User' },
  loading: false,
  hasAccess: () => true,
  hasPermission: () => true,
  loginUser: () => {},
  logoutUser: () => {},
  refreshRole: async () => {},
};

const customRender = (
  ui: ReactElement,
  { route = '/', roleValue = defaultRoleValue, ...renderOptions }: CustomRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route);

  const mergedRoleValue = { ...defaultRoleValue, ...roleValue };

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ToastProvider>
        <RoleContext.Provider value={mergedRoleValue as RoleContextType}>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </RoleContext.Provider>
      </ToastProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
