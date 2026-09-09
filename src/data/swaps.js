// ============================================================
//  SWAP REQUESTS — Mock swap data
// ============================================================

export const SWAP_REQUESTS = [
  {
    id: 'sw001',
    status: 'pending',     // pending | accepted | rejected | completed
    type: 'incoming',      // from requester's perspective: incoming = someone wants your item
    requesterId: 'u001',
    receiverId: 'demo',
    offeredProductId: 'p003',   // what the requester offers
    offeredProductName: 'DOMS Graphite Drawing Set — 12 Grades',
    offeredProductImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&q=80',
    requestedProductId: 'p012',  // what the requester wants
    requestedProductName: 'Moleskine A5 Sketchbook',
    requestedProductImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80',
    message: 'Hey! I\'d love to swap my DOMS graphite set for your Moleskine. Both are lightly used — fair trade?',
    location: 'Hyderabad',
    createdAt: '2026-09-08T10:00:00',
  },
  {
    id: 'sw002',
    status: 'accepted',
    type: 'outgoing',
    requesterId: 'demo',
    receiverId: 'u007',
    offeredProductId: 'p004',
    offeredProductName: 'Fevicryl Acrylic Colour Set — 20 Tubes',
    offeredProductImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80',
    requestedProductId: 'p002',
    requestedProductName: 'A3 Stretched Cotton Canvas — Pack of 5',
    requestedProductImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&q=80',
    message: 'I\'d like to offer my barely-used Fevicryl acrylics for your canvas pack. Let me know!',
    location: 'Bengaluru',
    createdAt: '2026-09-05T14:30:00',
  },
  {
    id: 'sw003',
    status: 'pending',
    type: 'incoming',
    requesterId: 'u010',
    receiverId: 'demo',
    offeredProductId: 'p011',
    offeredProductName: 'Air-Dry Polymer Clay — 1kg Mixed Set',
    offeredProductImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&q=80',
    requestedProductId: 'p006',
    requestedProductName: 'Handmade Cotton Rag Paper Bundle',
    requestedProductImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&q=80',
    message: 'Hello! Interested in swapping my polymer clay set for your handmade paper bundle. Both unused.',
    location: 'Bengaluru',
    createdAt: '2026-09-07T09:15:00',
  },
  {
    id: 'sw004',
    status: 'completed',
    type: 'outgoing',
    requesterId: 'demo',
    receiverId: 'u006',
    offeredProductId: 'p015',
    offeredProductName: 'Handcrafted Ceramic Palette',
    offeredProductImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&q=80',
    requestedProductId: 'p009',
    requestedProductName: 'Lino Block Printing Kit',
    requestedProductImage: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=300&q=80',
    message: 'Would you swap the lino kit for my ceramic palette? Both in great condition.',
    location: 'Delhi',
    createdAt: '2026-08-20T16:00:00',
  },
];

export const getSwapsByUser = (userId) =>
  SWAP_REQUESTS.filter(s => s.requesterId === userId || s.receiverId === userId);

export const getIncomingSwaps = (userId) =>
  SWAP_REQUESTS.filter(s => s.receiverId === userId);

export const getOutgoingSwaps = (userId) =>
  SWAP_REQUESTS.filter(s => s.requesterId === userId);
