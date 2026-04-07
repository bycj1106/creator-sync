import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../contexts/AuthContext';
import { dataApi } from '../services/api';
import { Planning } from '../pages/Planning';
import { Profile } from '../pages/Profile';
import { Tasks } from '../pages/Tasks';

function renderWithAuth(ui, { route = '/', state, authValue } = {}) {
  return render(
    <AuthContext.Provider
      value={{
        user: { id: 1, username: 'tester' },
        logout: vi.fn(),
        dataLoading: false,
        data: { plans: [], tasks: [], inspirations: [] },
        ...authValue,
      }}
    >
      <MemoryRouter initialEntries={[{ pathname: route, state }]}>
        <Routes>
          <Route path="/" element={ui} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('page behaviors', () => {
  it('prefills the planning modal when converting an inspiration into a plan', async () => {
    renderWithAuth(
      <Planning data={[]} updateData={vi.fn()} />,
      { state: { newPlanTitle: '爆款选题' } }
    );

    expect(await screen.findByText('新建视频规划')).toBeInTheDocument();
    expect(screen.getByDisplayValue('爆款选题')).toBeInTheDocument();
  });

  it('counts published plans from progress state in profile stats', async () => {
    renderWithAuth(
      <Profile />,
      {
        authValue: {
          data: {
            plans: [
              { id: '1', title: 'done', progress: '发布' },
              { id: '2', title: 'draft', progress: '创意' },
            ],
            tasks: [{ id: '1', title: 'todo', completed: false }],
            inspirations: [{ id: '1', content: 'idea' }],
          },
        },
      }
    );

    await waitFor(() => {
      expect(screen.getByText('已完成').parentElement?.textContent).toBe('1已完成');
    });
  });

  it('uses the API response when updating remote tasks', async () => {
    const updateData = vi.fn();
    vi.spyOn(dataApi, 'updateTask').mockResolvedValueOnce({
      id: 'task-1',
      title: 'server-title',
      category: 'core',
      completed: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    });

    const { container } = renderWithAuth(
      <Tasks
        data={[{ id: 'task-1', title: 'local-title', category: 'core', completed: false, createdAt: '2024-01-01T00:00:00.000Z' }]}
        updateData={updateData}
      />
    );

    fireEvent.click(container.querySelector('.card button'));

    await waitFor(() => {
      expect(updateData).toHaveBeenCalledWith('tasks', 'update', expect.objectContaining({
        title: 'server-title',
        completed: true,
      }));
    });
  });

  it('shows an in-app logout confirmation instead of browser confirm', async () => {
    const logout = vi.fn();
    renderWithAuth(<Profile />, { authValue: { logout } });

    fireEvent.click(screen.getByText('退出登录'));
    expect(await screen.findByText('确认退出登录')).toBeInTheDocument();

    const logoutButtons = screen.getAllByRole('button', { name: '退出登录' });
    fireEvent.click(logoutButtons[logoutButtons.length - 1]);
    expect(logout).toHaveBeenCalled();
  });
});
