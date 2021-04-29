-- select reservations.*, p2.*, ( 
--   SELECT  avg(property_reviews.rating)
--   FROM properties as p1
--   JOIN property_reviews ON p1.id = property_id 
--   WHERE p1.id = p2.id
--   GROUP BY p1.id) as avg_property_rating
-- FROM properties as p2
-- JOIN reservations on p2.id = property_id
-- WHERE guest_id = 1 and end_date < now()::date
-- ORDER BY start_date 
-- LIMIT 10;
SELECT properties.*, reservations.*, avg(rating) as average_rating
FROM reservations
JOIN properties ON reservations.property_id = properties.id
JOIN property_reviews ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
AND reservations.end_date < now()::date
GROUP BY properties.id, reservations.id
ORDER BY reservations.start_date
LIMIT 10;