import sys
import re

file_path = 'c:/Users/ADMIIN/VScode/final-project/web-app/src/pages/practice/SchoolExamPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f: current = f.read()

lines_to_remove = [
    "import { requestAutoExplanation, requestWeaknessAnalysis, sendExamChatMessage } from '../../features/exam/services/exam-ai-service'",
    "import { RecommendedReviewLinks } from '../../features/exam/components/RecommendedReviewLinks'",
    "import { inferKnowledgeReviewTopics, type KnowledgeReviewTopic } from '../../features/knowledge-review/utils/knowledge-review-topics'",
    "  const [isAnalyzingWeaknesses, setIsAnalyzingWeaknesses] = useState(false)",
    "  const [weaknessAnalysis, setWeaknessAnalysis] = useState('')",
    "  const [recommendedTopics, setRecommendedTopics] = useState<KnowledgeReviewTopic[]>([])",
    "  const [weaknessAnalysisError, setWeaknessAnalysisError] = useState('')",
]

for line in lines_to_remove:
    current = current.replace(line + '\n', '')

# Replace import that had multiple functions
current = current.replace("import { requestAutoExplanation, sendExamChatMessage } from '../../features/exam/services/exam-ai-service'", "import { requestAutoExplanation, sendExamChatMessage } from '../../features/exam/services/exam-ai-service'")
# Wait, I just need to replace the exact import lines if they changed. Let's just use regex for imports.

current = re.sub(r'import \{ requestAutoExplanation, requestWeaknessAnalysis, sendExamChatMessage \} from \'../../features/exam/services/exam-ai-service\'\n', 'import { requestAutoExplanation, sendExamChatMessage } from \'../../features/exam/services/exam-ai-service\'\n', current)

with open(file_path, 'w', encoding='utf-8') as f: f.write(current)
print('Removed unused imports and states')
