select properties.city as city, count(reservations) as total_reservations
from reservations
join properties on properties.id = property_id
group by properties.city
order by total_reservations DESC;