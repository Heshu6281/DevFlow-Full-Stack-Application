import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  PlusCircle,
  TrendingUp,
  Check,
  AlertCircle,
} from 'lucide-react';

import api from '@/services/api';
import { formatTimeAgo } from '@/utils/helpers';

const iconMap = {
  completed: {
    icon: CheckCircle2,
    cls: 'bg-success/10 text-success',
  },
  created: {
    icon: PlusCircle,
    cls: 'bg-info/10 text-info',
  },
  progress: {
    icon: TrendingUp,
    cls: 'bg-accent-soft text-accent',
  },
  blocked: {
    icon: AlertCircle,
    cls: 'bg-error/10 text-error',
  },
  default: {
    icon: Check,
    cls: 'bg-surface-2 text-text-secondary',
  },
};

export default function ActivityTimeline({ items, limit }) {
  const [activities, setActivities] = useState(
    Array.isArray(items) ? items : []
  );
  const [loading, setLoading] = useState(
    !Array.isArray(items)
  );

  useEffect(() => {
    // If activities are explicitly provided,
    // use them instead of making another API request.
    if (Array.isArray(items)) {
      setActivities(items);
      setLoading(false);
      return;
    }

    const loadActivities = async () => {
      try {
        setLoading(true);

        const response = await api.request('/activity');

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Unable to load recent activity.'
          );
        }

        const data = response?.data;

        const rawActivities = Array.isArray(data)
          ? data
          : Array.isArray(data?.activities)
            ? data.activities
            : [];

        const normalizedActivities = rawActivities.map(
          (item) => ({
            id: item.id,
            type: item.type || 'default',
            actor:
              item.actor ||
              item.user_name ||
              'You',
            action: item.action || '',
            target:
              item.target ||
              item.target_name ||
              item.title ||
              '',
            detail: item.detail || '',
            timestamp:
              item.timestamp ||
              item.created_at ||
              item.updated_at,
            project:
              item.project ||
              item.project_name ||
              '',
          })
        );

        setActivities(normalizedActivities);
      } catch (error) {
        console.error(
          'Activity API error:',
          error
        );

        // Do not fall back to mock/static activity.
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [items]);

  const list = limit
    ? activities.slice(0, limit)
    : activities;

  if (loading) {
    return (
      <div className="py-4 text-center text-sm text-text-tertiary">
        Loading recent activity...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-text-secondary">
          No recent activity yet.
        </p>

        <p className="mt-1 text-xs text-text-tertiary">
          Your recent project and task activity will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-5">
        {list.map((item, i) => {
          const cfg =
            iconMap[item.type] ||
            iconMap.default;

          const Icon = cfg.icon;
          const isLast =
            i === list.length - 1;

          return (
            <li
              key={item.id || `${item.timestamp}-${i}`}
              className="relative pb-5"
            >
              {!isLast && (
                <span
                  className="absolute left-[15px] top-8 h-full w-px bg-border"
                  aria-hidden="true"
                />
              )}

              <div className="relative flex gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.cls}`}
                >
                  <Icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 pt-0.5">
                  <p className="text-sm text-text-primary">
                    {item.actor && (
                      <span className="font-medium">
                        {item.actor}
                      </span>
                    )}{' '}

                    {item.action}{' '}

                    {item.target && (
                      <span className="font-medium">
                        “{item.target}”
                      </span>
                    )}

                    {item.detail && (
                      <span className="text-text-secondary">
                        {' '}
                        ({item.detail})
                      </span>
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {item.timestamp
                      ? formatTimeAgo(
                          item.timestamp
                        )
                      : ''}

                    {item.project && (
                      <>
                        {' · '}
                        {item.project}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}