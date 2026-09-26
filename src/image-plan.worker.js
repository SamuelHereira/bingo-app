import { calculateImagePlan } from './image-plan.js';
self.onmessage = ({data}) => {
  try {
    const plan = calculateImagePlan(data.size,data.count,minimum=>self.postMessage({minimum}));
    self.postMessage({plan});
  } catch(error) { self.postMessage({error:error.message}); }
};
