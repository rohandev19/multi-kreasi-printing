import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import { MetricCard } from '../MetricCard';
import { Users } from '@phosphor-icons/react';

describe('MetricCard Component', () => {
  it('renders title, value, and icon correctly', () => {
    render(
      <MetricCard 
        title="Total Users" 
        value="1,234" 
        icon={<Users weight="regular" />} 
      />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders positive trend correctly', () => {
    render(
      <MetricCard 
        title="Revenue" 
        value="$50K" 
        icon={<Users weight="regular" />} 
        trend={{ value: 12.5, direction: 'up' }}
      />
    );

    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });

  it('renders negative trend correctly', () => {
    render(
      <MetricCard 
        title="Bounce Rate" 
        value="45%" 
        icon={<Users weight="regular" />} 
        trend={{ value: 5.2, direction: 'down' }}
      />
    );

    expect(screen.getByText('5.2%')).toBeInTheDocument();
  });
});
