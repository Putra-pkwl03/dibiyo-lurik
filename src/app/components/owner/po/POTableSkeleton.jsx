export default function POTableSkeleton() {
  return (
    <>
      {[...Array(10)].map((_, idx) => (
        <tr key={idx} className="bg-white animate-pulse">
          <td className="p-4">
            <div className="w-4 h-4 rounded bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="w-24 h-4 font-mono rounded bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="h-4 rounded w-36 bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="w-16 h-4 rounded bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="h-6 rounded-full w-28 bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="w-20 h-6 rounded bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="w-24 h-4 rounded bg-stone-200"></div>
          </td>
          <td className="p-4">
            <div className="flex justify-center gap-3">
              <div className="rounded-lg h-9 w-14 bg-stone-200"></div>
              <div className="rounded-lg h-9 w-14 bg-stone-200"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}