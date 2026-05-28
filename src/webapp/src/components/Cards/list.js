import React, { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { isNil, reject } from 'ramda';
import { useTranslation } from 'react-i18next';

import {
  Avatar,
  Box,
  FormControl,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  NativeSelect,
  Typography
} from '@mui/material';

import BookmarkIcon from '@mui/icons-material/Bookmark';

const CardsList = ({ cardsList }) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem('phoniebox_cards_sort_by') || 'cardId';
  });

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSortBy(value);
    localStorage.setItem('phoniebox_cards_sort_by', value);
  };

  const getArgsString = (card) => {
    const args = card?.action?.args;
    if (!args) return '';
    if (Array.isArray(args)) return args.join(', ');
    if (typeof args === 'object') return Object.values(args).join(', ');
    return String(args);
  };

  const sortedKeys = cardsList ? Object.keys(cardsList).sort((a, b) => {
    if (sortBy === 'command') {
      const cmdA = cardsList[a].from_alias || cardsList[a].func || '';
      const cmdB = cardsList[b].from_alias || cardsList[b].func || '';
      const cmdCompare = cmdA.localeCompare(cmdB, undefined, { sensitivity: 'base' });
      if (cmdCompare !== 0) return cmdCompare;

      const argsA = getArgsString(cardsList[a]);
      const argsB = getArgsString(cardsList[b]);
      const argsCompare = argsA.localeCompare(argsB, undefined, { sensitivity: 'base' });
      if (argsCompare !== 0) return argsCompare;
    }

    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }) : [];

  const ListItemLink = (cardId) => {
    const EditCardLink = forwardRef((props, ref) => {
      const { data } = props;
      const location = {
        pathname: `/cards/${data.id}/edit`,
        state: data,
      };

      return <Link ref={ref} to={location} {...props} />
    });

    const description = cardsList[cardId].from_alias
      ? reject(
          isNil,
          [cardsList[cardId].from_alias, cardsList[cardId].action.args]
        ).join(', ')
      : cardsList[cardId].func

    return (
      <ListItem
        button
        component={EditCardLink}
        data={{ id: cardId, ...cardsList[cardId] }}
        key={cardId}
      >
        <ListItemAvatar>
          <Avatar>
            <BookmarkIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={cardId}
          secondary={description}
        />
      </ListItem>
    );
  }

  return (
    cardsList && Object.keys(cardsList).length > 0
      ? <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, mb: 2 }}>
            <FormControl variant="standard">
              <NativeSelect
                value={sortBy}
                onChange={handleSortChange}
                inputProps={{ 'aria-label': t('cards.list.sort-by') }}
              >
                <option value="cardId">{t('cards.list.sort-card-id')}</option>
                <option value="command">{t('cards.list.sort-command')}</option>
              </NativeSelect>
            </FormControl>
          </Box>
          <List sx={{ width: '100%' }}>
            {sortedKeys.map(ListItemLink)}
          </List>
        </Box>
      : <Typography>{t('cards.list.no-cards-registered')}</Typography>
  );
}

export default React.memo(CardsList);
