import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastContext';
import { RoleContext } from '../contexts/RoleContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  roleValue?: {
    role: string | null;
    user: any | null;
    loading: boolean;
    logout: () => void;
    refreshRole: () => Promise<void>;
  };
}

const defaultRoleValue = {
  role: 'User',
  user: { id: '1', fullName: 'Test User' },
  loading: false,
  logout: () => {},
  refreshRole: async () => {},
};

const customRender = (
  ui: ReactElement,
  { route = '/', roleValue = defaultRoleValue, ...renderOptions }: CustomRenderOptions = {}
) => {
  window.history.pushState({}, 'Test page', route);

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ToastProvider>
        <RoleContext.Provider value={roleValue}>
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
