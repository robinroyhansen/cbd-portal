'use client';

import { StudyType, getStudyTypeColor } from '../lib/quality-tiers';

interface StudyTypeBadgeProps {
  studyType: StudyType;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * StudyTypeBadge Component
 *
 * Displays a study methodology badge with appropriate styling and icons.
 * Each study type has distinct colors and explanatory tooltips.
 *
 * @param studyType - The type of study methodology
 * @param size - Badge size: xs, sm, md, or lg
 * @param showIcon - Whether to show methodology icon (default: true)
 * @param showTooltip - Whether to show hover tooltip (default: true)
 * @param className - Additional CSS classes
 */
export function StudyTypeBadge({
  studyType,
  size = 'sm',
  showIcon = true,
  showTooltip = true,
  className = ''
}: StudyTypeBadgeProps) {
  // Get study type specific styling
  const colorClasses = getStudyTypeColor(studyType);

  // Size-specific classes
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  // Study type icons and abbreviations
  const studyTypeInfo = {
    [StudyType.META_ANALYSIS]: {
      icon: '📊',
      abbrev: 'META',
      description: 'Statistical analysis combining results from multiple studies to provide stronger evidence',
      evidenceLevel: 'Highest (Level 1)'
    },
    [StudyType.SYSTEMATIC_REVIEW]: {
      icon: '📚',
      abbrev: 'SR',
      description: 'Comprehensive review of all available research on a specific topic using systematic methods',
      evidenceLevel: 'Highest (Level 1)'
    },
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: {
      icon: '🎯',
      abbrev: 'RCT',
      description: 'Participants randomly assigned to treatment or control groups to test effectiveness',
      evidenceLevel: 'High (Level 2)'
    },
    [StudyType.CONTROLLED_TRIAL]: {
      icon: '⚖️',
      abbrev: 'CT',
      description: 'Compares treatment groups but may not use randomization',
      evidenceLevel: 'Moderate (Level 3)'
    },
    [StudyType.COHORT_STUDY]: {
      icon: '👥',
      abbrev: 'COHORT',
      description: 'Follows groups of people over time to observe outcomes',
      evidenceLevel: 'Moderate (Level 3)'
    },
    [StudyType.CASE_CONTROL_STUDY]: {
      icon: '🔍',
      abbrev: 'CASE',
      description: 'Compares people with a condition to those without, looking back at exposures',
      evidenceLevel: 'Moderate (Level 4)'
    },
    [StudyType.CROSS_SECTIONAL_STUDY]: {
      icon: '📸',
      abbrev: 'CROSS',
      description: 'Observational study examining data at a single point in time',
      evidenceLevel: 'Lower (Level 4)'
    },
    [StudyType.CASE_SERIES]: {
      icon: '📝',
      abbrev: 'SERIES',
      description: 'Descriptive study following a group of patients with similar conditions',
      evidenceLevel: 'Lower (Level 5)'
    },
    [StudyType.CASE_REPORT]: {
      icon: '📄',
      abbrev: 'REPORT',
      description: 'Detailed description of a single patient case or small number of cases',
      evidenceLevel: 'Lowest (Level 5)'
    },
    [StudyType.ANIMAL_STUDY]: {
      icon: '🐭',
      abbrev: 'ANIMAL',
      description: 'Research conducted on animal models, providing preliminary evidence for human applications',
      evidenceLevel: 'Preclinical'
    },
    [StudyType.IN_VITRO_STUDY]: {
      icon: '🧪',
      abbrev: 'IN VITRO',
      description: 'Laboratory study using cells, tissues, or biological molecules outside living organisms',
      evidenceLevel: 'Preclinical'
    },
    [StudyType.REVIEW_ARTICLE]: {
      icon: '📖',
      abbrev: 'REVIEW',
      description: 'Summary of existing research, may not use systematic methodology',
      evidenceLevel: 'Variable'
    },
    [StudyType.SURVEY_STUDY]: {
      icon: '📋',
      abbrev: 'SURVEY',
      description: 'Study collecting data through questionnaires or interviews',
      evidenceLevel: 'Lower (Level 4)'
    },
    [StudyType.PILOT_STUDY]: {
      icon: '🛫',
      abbrev: 'PILOT',
      description: 'Small preliminary study designed to test feasibility and inform larger trials',
      evidenceLevel: 'Preliminary'
    },
    [StudyType.UNKNOWN]: {
      icon: '❓',
      abbrev: 'UNKNOWN',
      description: 'Study methodology not clearly identified from available information',
      evidenceLevel: 'Unknown'
    }
  };

  const info = studyTypeInfo[studyType];

  // Determine display text based on size
  const getDisplayText = () => {
    if (size === 'xs' || size === 'sm') {
      return info.abbrev;
    } else {
      return studyType;
    }
  };

  const badgeContent = (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && (
        <span className="text-xs" aria-hidden="true">
          {info.icon}
        </span>
      )}
      <span className="font-semibold">{getDisplayText()}</span>
    </span>
  );

  // If tooltips are disabled, return badge without wrapper
  if (!showTooltip) {
    return badgeContent;
  }

  // Tooltip wrapper
  return (
    <div className="group relative inline-block">
      {badgeContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-sm">
          <div className="font-semibold mb-1">{studyType}</div>
          <div className="text-gray-200 mb-2">{info.description}</div>
          <div className="text-gray-400 text-xs">
            Evidence Level: {info.evidenceLevel}
          </div>

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StudyTypeBadgeSimple Component
 *
 * A simplified version without tooltips for use in compact layouts
 */
export function StudyTypeBadgeSimple({
  studyType,
  size = 'xs',
  className = ''
}: Omit<StudyTypeBadgeProps, 'showTooltip' | 'showIcon'>) {
  return (
    <StudyTypeBadge
      studyType={studyType}
      size={size}
      showIcon={false}
      showTooltip={false}
      className={className}
    />
  );
}

/**
 * StudyTypeIcon Component
 *
 * Displays just the study type icon with minimal styling
 */
export function StudyTypeIcon({
  studyType,
  className = ''
}: Pick<StudyTypeBadgeProps, 'studyType' | 'className'>) {
  const studyTypeIcons = {
    [StudyType.META_ANALYSIS]: '📊',
    [StudyType.SYSTEMATIC_REVIEW]: '📚',
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: '🎯',
    [StudyType.CONTROLLED_TRIAL]: '⚖️',
    [StudyType.COHORT_STUDY]: '👥',
    [StudyType.CASE_CONTROL_STUDY]: '🔍',
    [StudyType.CROSS_SECTIONAL_STUDY]: '📸',
    [StudyType.CASE_SERIES]: '📝',
    [StudyType.CASE_REPORT]: '📄',
    [StudyType.ANIMAL_STUDY]: '🐭',
    [StudyType.IN_VITRO_STUDY]: '🧪',
    [StudyType.REVIEW_ARTICLE]: '📖',
    [StudyType.SURVEY_STUDY]: '📋',
    [StudyType.PILOT_STUDY]: '🛫',
    [StudyType.UNKNOWN]: '❓'
  };

  return (
    <span
      className={`inline-block text-lg ${className}`}
      title={studyType}
      role="img"
      aria-label={studyType}
    >
      {studyTypeIcons[studyType]}
    </span>
  );
}

/**
 * EvidenceLevelIndicator Component
 *
 * Shows the evidence level hierarchy with color coding
 */
export function EvidenceLevelIndicator({
  studyType,
  className = ''
}: Pick<StudyTypeBadgeProps, 'studyType' | 'className'>) {
  // Evidence level mapping
  const evidenceLevels = {
    [StudyType.META_ANALYSIS]: { level: 1, label: 'Level 1', color: 'bg-green-100 text-green-800' },
    [StudyType.SYSTEMATIC_REVIEW]: { level: 1, label: 'Level 1', color: 'bg-green-100 text-green-800' },
    [StudyType.RANDOMIZED_CONTROLLED_TRIAL]: { level: 2, label: 'Level 2', color: 'bg-blue-100 text-blue-800' },
    [StudyType.CONTROLLED_TRIAL]: { level: 3, label: 'Level 3', color: 'bg-yellow-100 text-yellow-800' },
    [StudyType.COHORT_STUDY]: { level: 3, label: 'Level 3', color: 'bg-yellow-100 text-yellow-800' },
    [StudyType.CASE_CONTROL_STUDY]: { level: 4, label: 'Level 4', color: 'bg-orange-100 text-orange-800' },
    [StudyType.CROSS_SECTIONAL_STUDY]: { level: 4, label: 'Level 4', color: 'bg-orange-100 text-orange-800' },
    [StudyType.SURVEY_STUDY]: { level: 4, label: 'Level 4', color: 'bg-orange-100 text-orange-800' },
    [StudyType.CASE_SERIES]: { level: 5, label: 'Level 5', color: 'bg-red-100 text-red-800' },
    [StudyType.CASE_REPORT]: { level: 5, label: 'Level 5', color: 'bg-red-100 text-red-800' },
    [StudyType.ANIMAL_STUDY]: { level: 0, label: 'Preclinical', color: 'bg-gray-100 text-gray-800' },
    [StudyType.IN_VITRO_STUDY]: { level: 0, label: 'Preclinical', color: 'bg-gray-100 text-gray-800' },
    [StudyType.REVIEW_ARTICLE]: { level: null, label: 'Review', color: 'bg-purple-100 text-purple-800' },
    [StudyType.PILOT_STUDY]: { level: null, label: 'Pilot', color: 'bg-indigo-100 text-indigo-800' },
    [StudyType.UNKNOWN]: { level: null, label: 'Unknown', color: 'bg-gray-100 text-gray-600' }
  };

  const evidence = evidenceLevels[studyType];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${evidence.color} ${className}`}
      title={`Evidence Level: ${evidence.label}`}
    >
      {evidence.label}
    </span>
  );
}

/**
 * StudyTypeFilter Component
 *
 * Interactive component for filtering by study types
 */
export interface StudyTypeFilterProps {
  selectedTypes: StudyType[];
  onToggleType: (type: StudyType) => void;
  availableTypes?: StudyType[];
  className?: string;
}

export function StudyTypeFilter({
  selectedTypes,
  onToggleType,
  availableTypes,
  className = ''
}: StudyTypeFilterProps) {
  // Default to all types if not specified
  const types = availableTypes || Object.values(StudyType);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {types.map((type) => (
        <button
          key={type}
          onClick={() => onToggleType(type)}
          className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border transition-all
            ${selectedTypes.includes(type)
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <StudyTypeIcon studyType={type} className="text-sm" />
          <span>{type}</span>
        </button>
      ))}
    </div>
  );
}

export default StudyTypeBadge;