import { prisma } from '../../lib/prisma';
import { formatServiceTypeLabel } from '../../lib/serviceTypeLabels';

export default function LeadsAdmin({ leads }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Pending Discovery Leads</h1>
      <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Service</th>
            <th>Budget</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead: any) => (
            <tr key={lead.id}>
              <td>{lead.full_name}</td>
              <td>{formatServiceTypeLabel(lead.service_type)}</td>
              <td>{lead.budget_range}</td>
              <td><button>Approve & Send Payment</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function getServerSideProps() {
  const leads = await prisma.discoveryFormSubmission.findMany({
    where: { status: 'PENDING_REVIEW' },
    orderBy: { created_at: 'desc' },
  });

  return {
    props: {
      leads: JSON.parse(JSON.stringify(leads)),
    },
  };
}
