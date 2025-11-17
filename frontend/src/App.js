import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Box, Typography, Button, Paper, Alert, Grid, TextField, List, ListItem, ListItemIcon, ListItemText,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles';

// --- ICONS ---
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Accordion

// --- THEME AND STYLES (from your example) ---
let theme = createTheme({
  palette: {
    primary: { 
      main: '#F57C00', // Carnelian Orange
      light: 'rgba(245, 124, 0, 0.08)',
    },
    secondary: { main: '#B31B1B' }, // Carnelian Red
    text: { primary: '#2c3e50', secondary: '#34495e' },
    background: { default: '#f8f9fa', paper: '#FFFFFF' },
    action: { hover: 'rgba(245, 124, 0, 0.04)' }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, color: '#B31B1B', textAlign: 'center' },
    h2: { fontWeight: 600, color: '#B31B1B', textAlign: 'center', marginBottom: '1.5rem' },
    h4: { fontWeight: 600, color: '#B31B1B' },
    h5: { color: '#F57C00', fontWeight: 600, borderBottom: '2px solid #F57C00', paddingBottom: '0.5rem', marginBottom: '1rem' },
    body1: { fontSize: '1rem', lineHeight: 1.6, color: '#2c3e50' },
    body2: { fontSize: '0.9rem', color: '#34495e' },
  },
});
theme = responsiveFontSizes(theme);

const containerStyles = {
  padding: { xs: 2, sm: 3, md: 4 },
  margin: { xs: '1rem auto', md: '2rem auto' },
  borderRadius: '15px',
  backgroundColor: 'background.paper',
  border: '1px solid #e9ecef',
  maxWidth: { xs: '100%', sm: '700px', md: '900px' },
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
};

// --- BELBIN QUESTIONNAIRE DATA ---
const sections = {
    A: {
      title: 'WHEN INVOLVED IN A PROJECT WITH OTHER PEOPLE:',
      questions: [
        { id: 'A1', text: 'I can be relied upon to see that work that needs to be done is organized.' },
        { id: 'A2', text: 'I pick up slips and omissions that others fail to notice.' },
        { id: 'A3', text: 'I react strongly when meetings look like losing track of the main objective.' },
        { id: 'A4', text: 'I produce original suggestions.' },
        { id: 'A5', text: "I analyze other people's ideas objectively, for both merits and failings." },
        { id: 'A6', text: 'I am keen to find out the latest ideas and developments.' },
        { id: 'A7', text: 'I have an aptitude for organizing people.' },
        { id: 'A8', text: 'I am always ready to support good suggestions that help to resolve a problem.' },
      ],
    },
    B: {
        title: 'IN SEEKING SATISFACTION THROUGH MY WORK:',
        questions: [
            { id: 'B1', text: 'I like to have a strong influence on decisions.' },
            { id: 'B2', text: 'I feel in my element where work requires a high degree of attention and concentration.' },
            { id: 'B3', text: 'I am concerned to help colleagues with their problems.' },
            { id: 'B4', text: 'I like to make critical discriminations between alternatives.' },
            { id: 'B5', text: 'I tend to have a creative approach to problem solving.' },
            { id: 'B6', text: 'I enjoy reconciling different points of view.' },
            { id: 'B7', text: 'I am more interested in practicalities than in new ideas.' },
            { id: 'B8', text: 'I particularly enjoy exploring different views and techniques.' },
        ],
    },
    C: {
        title: 'WHEN THE TEAM IS TRYING TO SOLVE A PARTICULARLY COMPLEX PROBLEM:',
        questions: [
            { id: 'C1', text: 'I keep a watching eye on areas where difficulty may arise.' },
            { id: 'C2', text: 'I explore ideas that may have a wider application than in the immediate task.' },
            { id: 'C3', text: 'I like to weigh up and evaluate a range of suggestions thoroughly before choosing.' },
            { id: 'C4', text: "I can co-ordinate and use productively other people's abilities and talents." },
            { id: 'C5', text: 'I maintain a steady systematic approach, whatever the pressures.' },
            { id: 'C6', text: 'I often produce a new approach to a long continuing problem.' },
            { id: 'C7', text: 'I am ready to make my personal views known in a forceful way if necessary.' },
            { id: 'C8', text: 'I am ready to help whenever I can.' },
        ],
    },
    D: {
        title: 'IN CARRYING OUT MY DAY-TO-DAY WORK:',
        questions: [
            { id: 'D1', text: 'I am keen to see there is nothing vague about my task and objectives.' },
            { id: 'D2', text: 'I am not reluctant to emphasize my own point of view in meetings.' },
            { id: 'D3', text: 'I can work with all sorts of people provided that they have got something worthwhile to contribute.' },
            { id: 'D4', text: 'I make a point of following up interesting ideas and/or people.' },
            { id: 'D5', text: 'I can usually find the argument to refute unsound propositions.' },
            { id: 'D6', text: 'I tend to see patterns where others would see items as unconnected.' },
            { id: 'D7', text: 'Being busy gives me real satisfaction.' },
            { id: 'D8', text: 'I have a quiet interest in getting to know people better.' },
        ],
    },
    E: {
        title: 'IF I AM SUDDENLY GIVEN A DIFFICULT TASK WITH LIMITED TIME AND UNFAMILIAR PEOPLE:',
        questions: [
            { id: 'E1', text: 'I often find my imagination frustrated by working in a group.' },
            { id: 'E2', text: 'I find my personal skill particularly appropriate in achieving agreement.' },
            { id: 'E3', text: 'My feelings seldom interfere with my judgment.' },
            { id: 'E4', text: 'I strive to build up an effective structure.' },
            { id: 'E5', text: 'I can work with people who vary widely in their personal qualities and outlook.' },
            { id: 'E6', text: "I feel it is sometimes worth incurring some temporary unpopularity if one is to succeed in getting one's views across in a group." },
            { id: 'E7', text: 'I usually know someone whose specialist knowledge is particularly apt.' },
            { id: 'E8', text: 'I seem to develop natural sense urgency.' },
        ],
    },
    F: {
        title: 'WHEN SUDDENLY ASKED TO CONSIDER A NEW PROJECT:',
        questions: [
            { id: 'F1', text: 'I start to look around for possible ideas and openings.' },
            { id: 'F2', text: 'I am concerned to finish and perfect current work before I start.' },
            { id: 'F3', text: 'I approach the problem in a carefully analytical way.' },
            { id: 'F4', text: 'I am able to assert myself to get other people involved if necessary.' },
            { id: 'F5', text: 'I am able to take independent and innovative look at most situations.' },
            { id: 'F6', text: 'I am happy to take the lead when action is required.' },
            { id: 'F7', text: 'I can respond positively to my colleagues and their initiatives.' },
            { id: 'F8', text: 'I find it hard to give in a job where the goals are not clearly defined.' },
        ],
    },
    G: {
        title: 'IN CONTRIBUTING TO GROUP PROJECTS IN GENERAL:',
        questions: [
            { id: 'G1', text: 'I think I have a talent for sorting out the concrete steps that need to be taken given a broad brief.' },
            { id: 'G2', text: 'My considered judgement may take time but is usually near the mark.' },
            { id: 'G3', text: 'A broad range of personal contacts is important to my style of working.' },
            { id: 'G4', text: 'I have an eye for getting the details right.' },
            { id: 'G5', text: 'I try to make my mark in group meetings.' },
            { id: 'G6', text: 'I can see how ideas and techniques can be used in new relationships.' },
            { id: 'G7', text: 'I see both sides of a problem and take decisions acceptable to all.' },
            { id: 'G8', text: 'I get on well with others and work hard for the team.' },
        ],
    },
};

const sectionIds = Object.keys(sections);

const scoringKey = {
    SH: { A: 3, B: 1, C: 7, D: 2, E: 6, F: 6, G: 5 },
    CO: { A: 7, B: 6, C: 4, D: 3, E: 5, F: 4, G: 7 },
    PL: { A: 4, B: 5, C: 6, D: 6, E: 1, F: 5, G: 6 },
    RI: { A: 6, B: 8, C: 2, D: 4, E: 7, F: 1, G: 3 },
    ME: { A: 5, B: 4, C: 3, D: 5, E: 3, F: 3, G: 2 },
    IMP: { A: 1, B: 7, C: 5, D: 1, E: 4, F: 8, G: 1 },
    TW: { A: 8, B: 3, C: 8, D: 8, E: 2, F: 7, G: 8 },
    F: { A: 2, B: 2, C: 1, D: 7, E: 8, F: 2, G: 4 },
};

// --- FULL ROLE DESCRIPTIONS FROM PDF ---
const roleDescriptions = {
    CO: {
        title: 'The Coordinator',
        strengths: ['Purposeful', 'Supportive', 'Impartial', 'Enthusiastic', 'Unflappable', 'Conciliatory', 'Controlled', 'Trusting', 'Calm', 'Self-confident'],
        areas_of_improvement: ['Uncompetitive', 'Not forceful', 'Unambitious', 'Amateurish', 'Lazy'],
        general_approach: "Has a strong sense of overall objectives. Is able to keep an open mind and value contributions from any source. Generally of average mental ability and creativity. Good at controlling and coordinating resources. Democratic and encourages participation, but willing to take responsibility for decisions. Although the Coordinator is sometimes seen as reserved and detached, the ability to remain objective is valuable when directing the efforts and activities of others towards an overall goal or objective."
    },
    SH: {
        title: 'The Shaper',
        strengths: ['Resilient', 'Restless/strong sense of drive', 'Opportunist', 'Effective', 'Sociable', 'Outgoing', 'Dynamic'],
        areas_of_improvement: ['Intense', 'Highly strung', 'Authoritarian', 'Over-anxious', 'Impatient', 'Prone to sulk'],
        general_approach: "Strong sense of drive and urgency. Readiness to challenge inertia, ineffectiveness, complacency, self-deception and general lack of progress. Prone to provocation, irritation and impatience. May be seen as a bully by some, and may sulk if not getting own way. Strong preference to lead 'from the front' with an inner need to control decisions and actions personally. Can be quite aggressive and wants to see own ideas implemented, and quickly. Hates rules and regulations. A 'natural' leader in some ways, and can command respect and generate enthusiasm and energy in others. Can be skeptical of others and yet be over-sensitive to criticism of own ideas."
    },
    PL: {
        title: 'The Plant',
        strengths: ['Innovative', 'Intuitive', 'Flashes of genius', 'Imagination', 'Intellect', 'Knowledge', 'Serious-minded', 'Unorthodox'],
        areas_of_improvement: ['Solitary', 'Intense', 'Wayward', 'Impractical', 'Erratic', 'Individualistic'],
        general_approach: "Think of Plants as having the ability to scatter around lots of ideas (seeds), many of which may lead to success while many may not. The Plant is the source of a team's creativity, with a fertile and intelligent mind, with plenty of original ways of looking at things. The Plant is concerned with the challenge of the new and can be obsessive. Often seen as having a head in the clouds, can be unaware of the need for sensitivity towards others. The Plant may not have much time for protocol or the 'proper way of doing things', nor be terribly concerned with the practical implications of own schemes. Tends to be self-sufficient and can be a difficult and uncomfortable colleague. However, can also be caught up in a wave of enthusiasm (especially for own ideas, but also for others whose ideas capture the Plant's imagination) and can be swept along with general team euphoria. There is a childlike element present in the Plant - likes to be flattered and does not like own ideas criticized."
    },
    ME: {
        title: 'The Monitor Evaluator',
        strengths: ['Analytical', 'Reflective', 'Impartial', 'Prudent', 'Shrewd', 'Unemotional'],
        areas_of_improvement: ['Unimaginative', 'Over-critical', 'Dry'],
        general_approach: "The Monitor Evaluator is a highly intelligent team member whose principal team asset is an ability to process large amounts of information in an analytical, objective way. Possesses good judgment and shows a 'hard-headed', shrewd approach to issues and ideas. Is cautious, perceptive and highly critical of flawed thinking in others. Is the most likely person in a team to spot the fatal error in a scheme that everyone else has missed. The Monitor Evaluator is, as a result, likely to be seen by the rest of the team as a 'wet blanket', dampening down enthusiasm. Tends to lack the ability to inspire and motivate others, and is rarely the source of new ideas. Although the Monitor Evaluator is often seen as over-critical and negative, the role is nevertheless crucial to successful team outcomes."
    },
    RI: {
        title: 'The Resource Investigator',
        strengths: ['Resourceful', 'Enthusiastic', 'Opportunist', 'Communicative', 'Outgoing', 'Sociable', 'Curious'],
        areas_of_improvement: ['Wayward', 'Over-enthusiastic', 'Impatient'],
        general_approach: "The Resource Investigator is the team's ambassador in its dealings with the world beyond the team's boundary. Has the capacity for making highly effective contact with people and for exploring anything new. Will respond to new situations as exciting challenges, but can also lose interest quite quickly if progress is slow or once the initial fascination has passed. Variety and people are the essential diet of the Resource Investigator, who also has the ability in turn to stimulate and motivate others. The need for new stimuli can often result in a 'butterfly mind', flitting quickly from one thing to another very rapidly, and there can be a lack of self-discipline and a failure to follow things through. It has been said that the Resource Investigator is either on the telephone or is out meeting people, and hates doing anything else."
    },
    IMP: {
        title: 'The Implementer',
        strengths: ['Disciplined', 'Organized', 'Unflappable', 'Practical', 'Steady', 'Controlled', 'Conservative', 'Dutiful', 'Predictable'],
        areas_of_improvement: ['Inflexible', 'Unimaginative', 'Rigid', 'Pedantic', 'Submissive'],
        general_approach: "The Implementer is the team member who, above all, will be able to foresee how the team's ideas and plans will work out in practice. The Implementer tends to identify strongly with the organization and has a knack of knowing what practical issues will need to be faced. The Implementer is naturally conservative and has to be convinced that an idea is a good one not just because it is new but because it is of genuine worth. Has real organizing ability and plenty of practical common sense. Hard working and strongly self disciplined but can sometimes lack flexibility. Above all is systematic and thorough and tangible results are the Implementer's yardstick for effectiveness. Happy when involved with, or designing, rules and procedures for implementation and tends to be less effective when procedures and objectives are unclear. The Implementer has the ability to bring things down to earth, sometimes with a nasty bump."
    },
    TW: {
        title: 'The Teamworker',
        strengths: ['Supportive', 'Enthusiastic', 'Communicative', 'Outgoing', 'Conciliatory', 'Trusting', 'Sociable', 'Socially oriented', 'Mild and sensitive'],
        areas_of_improvement: ['Uncompetitive', 'Unforceful', 'Unambitious', 'Submissive'],
        general_approach: "The Team Worker is the fabric that helps to bind a team together. Promotes team spirit. Makes people laugh, is sensitive to other's feelings and to overall team mood. Is aware of the strengths and weaknesses of others and responds appropriately to people's differing needs. The most likely team member to know about personal problems and crises of other members, not out of a sense of prurience but out of genuine concern. Can be indecisive in a crisis and may lack the necessary toughness in certain situations, but ability to 'read' others and to recognize own differing abilities promotes high morale and a good sense of cooperation. For this reason is often team leader."
    },
    F: {
        title: 'The Finisher',
        strengths: ['Meticulous', 'Disciplined', 'Painstaking', 'Orderly', 'Conscientious', 'Concern for detail'],
        areas_of_improvement: ['Worrier', 'Pedantic', 'Dry'],
        general_approach: "The Completer-Finisher is the team member who crosses the t's and dots the i's. A strong capacity for follow-through coupled with a striking for perfection causes much anxiety. Will worry over small items but, overall, accomplishes tasks well and on time. The nervous energy that is invested in the team's final product results in a high standard. Tends not to be a good leader - is fussy and can get bogged down in detail which may lower team morale. However, the Completer-Finisher is dogged and persistent and will not give up until satisfied with own high standards."
    }
};


function App() {
  const [step, setStep] = useState('welcome');
  const [userInfo, setUserInfo] = useState({ name: '', organization: '' });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, currentSectionIndex]);

  const handleStart = () => {
    if (userInfo.name && userInfo.organization) {
      setError('');
      setStep('assessment');
    } else {
      setError('Please fill out both your name and organization.');
    }
  };

  const handleScoreChange = (sectionId, questionId, value) => {
    const newScores = { ...scores };
    if (!newScores[sectionId]) {
      newScores[sectionId] = {};
    }
    
    const numericValue = value === '' ? 0 : parseInt(value, 10);
    if (isNaN(numericValue) || numericValue < 0) return; // Enforce whole numbers

    newScores[sectionId][questionId] = numericValue;

    const sectionTotal = Object.values(newScores[sectionId]).reduce((acc, val) => acc + val, 0);
    if (sectionTotal > 10) {
      setError(`The total points for Section ${sectionId} cannot exceed 10.`);
    } else {
      setError('');
    }
    setScores(newScores);
  };

  const calculateSectionTotal = (sectionId) => {
    if (!scores[sectionId]) return 0;
    return Object.values(scores[sectionId]).reduce((acc, val) => acc + val, 0);
  };

  const calculateResults = () => {
    const roleTotals = { SH: 0, CO: 0, PL: 0, RI: 0, ME: 0, IMP: 0, TW: 0, F: 0 };

    for (const role in scoringKey) {
        for (const section in scoringKey[role]) {
            const questionNumber = scoringKey[role][section];
            const questionId = `${section}${questionNumber}`;
            if (scores[section] && scores[section][questionId]) {
                roleTotals[role] += scores[section][questionId];
            }
        }
    }
    
    const sortedRoles = Object.entries(roleTotals).sort(([, a], [, b]) => b - a);
    setResults(sortedRoles);
  };

  const handleSubmit = async () => {
    if (calculateSectionTotal(sectionIds[currentSectionIndex]) !== 10) {
        setError('Please ensure you have allocated exactly 10 points for this section before submitting.');
        return;
    }
    setError('');
    calculateResults();
    setStep('results');

    const payload = {
      name: userInfo.name,
      organization: userInfo.organization,
      responses: scores,
    };

    try {
      await axios.post('https://belbin-backend-app.onrender.com/submit-belbin', payload);
      console.log("Results submitted", payload);
    } catch (error) {
      console.error("Failed to submit results:", error);
    }
  };

  const handleNextSection = () => {
    const currentSectionId = sectionIds[currentSectionIndex];
    if (calculateSectionTotal(currentSectionId) !== 10) {
      setError('Please ensure you have allocated exactly 10 points for this section to continue.');
      return;
    }
    setError('');
    if (currentSectionIndex < sectionIds.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePreviousSection = () => {
    setError('');
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const renderWelcome = () => (
    <Paper elevation={3} sx={containerStyles}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box component="img" src="/logo.png" alt="Carnelian Logo" sx={{ maxWidth: { xs: '100px', sm: '120px' }, height: 'auto' }} />
        <Typography variant="h1">The BELBIN Questionnaire</Typography>
      </Box>
      <Typography variant="h5" align="center" color="text.secondary" sx={{ mb: 4, fontWeight: 'normal', px: { xs: 1, sm: 2 } }}>
        Discover your preferred team roles to enhance teamwork and collaboration.
      </Typography>
      <Box sx={{ maxWidth: { xs: '100%', sm: 400 }, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 2, px: { xs: 1, sm: 0 } }}>
        <TextField fullWidth label="Your Name" variant="outlined" value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} />
        <TextField fullWidth label="Your Organization" variant="outlined" value={userInfo.organization} onChange={(e) => setUserInfo({ ...userInfo, organization: e.target.value })} />
        {error && <Alert severity="error">{error}</Alert>}
        <Button variant="contained" size="large" color="primary" onClick={handleStart} disabled={!userInfo.name || !userInfo.organization} startIcon={<RocketLaunchIcon />} sx={{ mt: 2, py: 1.5, width: { xs: '100%', sm: 'auto' }, alignSelf: 'center' }}>
          Start Assessment
        </Button>
      </Box>
    </Paper>
  );

  const renderAssessment = () => {
    const currentSectionId = sectionIds[currentSectionIndex];
    const currentSection = sections[currentSectionId];
    const sectionTotal = calculateSectionTotal(currentSectionId);

    return (
      <Paper sx={containerStyles}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h2">Section {currentSectionId}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Distribute a total of 10 points among the statements that you feel best describe your behavior.
          </Typography>
          
          <Paper elevation={2} sx={{ p: 2, backgroundColor: 'primary.light', border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
            <Typography variant="h6" color="primary.main" gutterBottom>Core Rules</Typography>
            <List dense>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary"/></ListItemIcon><ListItemText primary="Allocate exactly 10 points per section." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary"/></ListItemIcon><ListItemText primary="Use whole numbers only (e.g., 1, 5, 10)." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary"/></ListItemIcon><ListItemText primary="Only give points to statements that apply to you." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary"/></ListItemIcon><ListItemText primary="You are advised to avoid giving all 10 points to a single statement." secondary="A broader distribution often gives a more accurate result." /></ListItem>
            </List>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
            <Typography variant="h6">Total Points Allocated:</Typography>
            <Typography variant="h5" color={sectionTotal === 10 ? 'green' : 'secondary.main'} sx={{ fontWeight: 'bold' }}>
              {sectionTotal} / 10
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="h5">{currentSection.title}</Typography>
          {currentSection.questions.map((q, index) => (
            <Grid container key={q.id} spacing={2} alignItems="center" sx={{ mt: 1, borderTop: '1px solid #eee', pt: 2 }}>
              <Grid item xs={8} sm={9}>
                <Typography>{`${index + 1}. ${q.text}`}</Typography>
              </Grid>
              <Grid item xs={4} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <TextField
                  sx={{ maxWidth: '100px' }}
                  type="number"
                  label="Points"
                  variant="outlined"
                  value={scores[currentSectionId]?.[q.id] || ''}
                  onChange={(e) => handleScoreChange(currentSectionId, q.id, e.target.value)}
                  inputProps={{ min: 0, max: 10, step: 1 }}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
        {error && <Alert severity="warning" sx={{ mt: 3 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: 1.5, mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
          {currentSectionIndex < sectionIds.length - 1 ? (
            <Button variant="contained" fullWidth size="large" onClick={handleNextSection} endIcon={<ArrowForwardIcon />}>Next Section</Button>
          ) : (
            <Button variant="contained" fullWidth size="large" color="primary" onClick={handleSubmit}>Submit & View Results</Button>
          )}
          {currentSectionIndex > 0 && (<Button variant="outlined" fullWidth size="large" onClick={handlePreviousSection} startIcon={<ArrowBackIcon />}>Previous</Button>)}
        </Box>
      </Paper>
    );
  };

  const renderRoleAccordion = (roleKey, roleTitle, isPrimary = false) => {
    const roleData = roleDescriptions[roleKey];
    if (!roleData) return null;

    return (
        <Accordion 
            sx={{ 
                boxShadow: 3, 
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: '16px 0' }
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${roleKey}-content`}
                id={`panel-${roleKey}-header`}
                sx={{ 
                    backgroundColor: isPrimary ? 'primary.main' : 'grey.200',
                    '& .MuiAccordionSummary-expandIconWrapper .MuiSvgIcon-root': {
                        color: isPrimary ? 'white' : 'text.primary',
                    },
                    minHeight: 80, // Increased height for better spacing
                    borderRadius: 1,
                }}
            >
                <Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: isPrimary ? 'white' : 'text.secondary', mb: 1 }}>{roleTitle}</Typography>
                    <Typography 
                        variant="h4" 
                        component="div"
                        sx={{ 
                            fontWeight: 'bold', 
                            color: isPrimary ? 'white' : 'primary.main',
                            borderBottom: '3px solid',
                            borderColor: isPrimary ? 'white' : 'primary.main',
                            paddingBottom: '4px',
                            display: 'inline-block',
                            lineHeight: 1.1
                        }}
                    >
                        {roleData.title}
                    </Typography>
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, borderTop: 1, borderColor: 'grey.300' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" component="h4">Strengths</Typography>
                        <List dense>
                            {roleData.strengths.map(item => <ListItem key={item}><ListItemText primary={item} /></ListItem>)}
                        </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" component="h4">Areas of Improvement</Typography>
                        <List dense>
                            {roleData.areas_of_improvement.map(item => <ListItem key={item}><ListItemText primary={item} /></ListItem>)}
                        </List>
                    </Grid>
                </Grid>
                <Box mt={3} pt={3} borderTop={1} borderColor="grey.300">
                    <Typography variant="h5" component="h4" gutterBottom>General Approach</Typography>
                    <Typography variant="body1">{roleData.general_approach}</Typography>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    const [primaryRole, secondaryRole] = results;

    return (
      <Paper sx={containerStyles}>
        <Box textAlign="center" mb={5}>
          <Typography variant="h1" component="h1">Your Belbin Team Roles</Typography>
          <Typography variant="h6" color="text.secondary">Hello {userInfo.name}, here is your preferred team role profile.</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderRoleAccordion(primaryRole[0], 'Your Primary Team Role', true)}
            {renderRoleAccordion(secondaryRole[0], 'Your Secondary Team Role')}
        </Box>

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
            Thank you for taking the Belbin Questionnaire. Understanding your roles can help you become a more effective team member.
        </Typography>
      </Paper>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" sx={{ mt: { xs: 2, sm: 3 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        {step === 'welcome' && renderWelcome()}
        {step === 'assessment' && renderAssessment()}
        {step === 'results' && renderResults()}
      </Container>
    </ThemeProvider>
  );
}

export default App;