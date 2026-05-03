import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/t/$tableNumber')({
  beforeLoad: ({ params }) => {
    const n = parseInt(params.tableNumber, 10);
    const table = Number.isFinite(n) && n > 0 ? n : 1;
    throw redirect({ to: '/menu', search: { table } });
  },
});
