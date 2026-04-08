import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/students');
      return res.json();
    },
  });
};

// OGI update के बाद auto refresh
export const useUpdateOGI = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ studentId }) => {
      await fetch(`/api/students/${studentId}/ogi`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['studentDetail'] });
    },
  });
};
