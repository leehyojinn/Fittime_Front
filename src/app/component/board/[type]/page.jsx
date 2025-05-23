'use client'

import { useParams } from 'next/navigation'
import Event from '../Event';
import QnA from '../QnA';
import Suggestions from '../Suggestions';

export default function BoardTypePage() {
  const { type } = useParams();

  return (
    <div>
      {type === 'event' && <Event />}
      {type === 'qna' && <QnA />}
      {type === 'suggestions' && <Suggestions/>}
    </div>
  );
}
