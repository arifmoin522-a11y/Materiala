// ============================================================
//  CHATS — Mock conversation threads
// ============================================================

export const CONVERSATIONS = [
  {
    id: 'conv001',
    participants: ['demo', 'u003'],
    productId: 'p001',
    productName: 'Winsor & Newton Cotman Watercolor Set',
    lastMessage: 'Sure! Can you share the listing link?',
    lastMessageAt: '2026-09-08T18:32:00',
    unreadCount: 1,
    messages: [
      {
        id: 'm001',
        senderId: 'u003',
        text: 'Hey! The watercolor set is still available. Pickup from South Delhi works.',
        timestamp: '2026-09-08T17:45:00',
        type: 'text',
      },
      {
        id: 'm002',
        senderId: 'demo',
        text: 'Great! Would you consider a swap for my unused acrylic tubes? Fevicryl, barely touched.',
        timestamp: '2026-09-08T18:10:00',
        type: 'text',
      },
      {
        id: 'm003',
        senderId: 'u003',
        text: 'That actually sounds interesting — I\'ve been wanting to try acrylics.',
        timestamp: '2026-09-08T18:20:00',
        type: 'text',
      },
      {
        id: 'm004',
        senderId: 'demo',
        text: 'It\'s a 20-tube Fevicryl set, about ₹480 worth. I can drop it off in Malviya Nagar.',
        timestamp: '2026-09-08T18:25:00',
        type: 'text',
      },
      {
        id: 'm005',
        senderId: 'u003',
        text: 'Sure! Can you share the listing link?',
        timestamp: '2026-09-08T18:32:00',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv002',
    participants: ['demo', 'u005'],
    productId: 'p005',
    productName: 'Da Vinci Maestro Round Brush Set',
    lastMessage: 'The brushes are in excellent condition — sable tips perfectly intact.',
    lastMessageAt: '2026-09-07T22:15:00',
    unreadCount: 0,
    messages: [
      {
        id: 'm006',
        senderId: 'demo',
        text: 'Hi Rohan! Are the Da Vinci brushes still available?',
        timestamp: '2026-09-07T21:30:00',
        type: 'text',
      },
      {
        id: 'm007',
        senderId: 'u005',
        text: 'Yes they are! They\'re honestly like new — I barely used them.',
        timestamp: '2026-09-07T21:45:00',
        type: 'text',
      },
      {
        id: 'm008',
        senderId: 'demo',
        text: 'Would you take ₹950 for them?',
        timestamp: '2026-09-07T21:50:00',
        type: 'text',
      },
      {
        id: 'm009',
        senderId: 'u005',
        text: 'The brushes are in excellent condition — sable tips perfectly intact.',
        timestamp: '2026-09-07T22:15:00',
        type: 'text',
      },
    ],
  },
  {
    id: 'conv003',
    participants: ['demo', 'u012'],
    productId: 'p013',
    productName: 'Copic Sketch Markers — 36 Colour Set',
    lastMessage: 'Sure, we can do that this weekend.',
    lastMessageAt: '2026-09-06T14:00:00',
    unreadCount: 2,
    messages: [
      {
        id: 'm010',
        senderId: 'demo',
        text: 'Hello Nidhi! I\'ve been looking for Copic markers for months. Are these still up?',
        timestamp: '2026-09-06T11:00:00',
        type: 'text',
      },
      {
        id: 'm011',
        senderId: 'u012',
        text: 'Yes! All 36 working perfectly. These are proper Copic Sketches, not the cheaper range.',
        timestamp: '2026-09-06T11:30:00',
        type: 'text',
      },
      {
        id: 'm012',
        senderId: 'demo',
        text: 'Would you be open to a meetup in South Chennai this weekend to inspect before buying?',
        timestamp: '2026-09-06T13:45:00',
        type: 'text',
      },
      {
        id: 'm013',
        senderId: 'u012',
        text: 'Sure, we can do that this weekend.',
        timestamp: '2026-09-06T14:00:00',
        type: 'text',
      },
    ],
  },
];

export const getConversationById = (id) => CONVERSATIONS.find(c => c.id === id);
export const getConversationsForUser = (userId) =>
  CONVERSATIONS.filter(c => c.participants.includes(userId));
