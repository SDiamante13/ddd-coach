export const EXAMPLE_THREAD = `Example thread (fictional). #late-loads at a made-up freight broker. Every person, customer, carrier and load is invented.

Mon 08:02  Ops day desk: morning. dock 4 scanner is down again, using the handhelds till facilities shows up
Mon 08:05  Carrier desk: +1, dock 2 too
Mon 08:11  Account team: before Friday's service review, one thing for everyone: in the contract a load is late when we miss the delivery appointment the customer booked. Service credits are based on that and nothing else.
Mon 08:12  Ops day desk: 👍
Mon 08:12  Billing: 👍
Mon 08:30  Dev: deploying the tracking page at 10, about 5 min of downtime
Mon 08:31  Billing: not during the invoice run please
Mon 08:33  Dev: moved to 11
Mon 09:02  Carrier desk: anyone seen the new rate sheet from Carrier 3? the one in the drive is from June
Mon 09:05  Billing: it's in the finance folder, I'll move it
Mon 09:40  Ops day desk: for us late is simpler. truck not at the pickup by the end of the window = late. that's what we chase carriers on
Mon 09:44  Carrier desk: and carriers only pay a late fee for a missed pickup. once it's rolling the delivery is on them, we don't track the appointment
Mon 10:02  Ops night desk: nights mark a load late as soon as the ETA slips past the delivery appointment, even before pickup. otherwise the customer hears it from the driver first
Mon 10:05  Ops day desk: that's a forecast, not late
Mon 10:06  Ops night desk: tell that to Customer B at 3am
Mon 10:07  Carrier desk: 😅
Mon 11:15  Billing: who owns the weekly late report now? it used to be the analyst who left
Mon 11:20  Dev: it's the late_loads query. from the repo:
    late = actual_pickup_at > pickup_window_end
    -- delivery_appointment isn't used: it's nullable and about half the loads don't have one
Mon 11:21  Billing: ok so the report is pickup
Mon 11:22  Dev: yes
Mon 12:30  Carrier desk: lunch? the taco place
Mon 12:31  Ops day desk: +1
Mon 12:31  Dev: +1
Tue 09:05  Account team: Customer D wants their Q3 on-time % for their board pack. I'll use the weekly report numbers
Tue 09:10  Ops day desk: fine by me
Tue 11:40  Ops night desk: handover: 7690 and 7702 still waiting on PODs
Tue 13:48  Dev: 2nd floor printer is jammed again
Tue 13:50  Billing: it's always the 2nd floor one
Tue 13:52  Carrier desk: there's a ticket, 3 weeks old
Wed 07:55  Ops night desk: load 7731 (Customer D): carrier got to the pickup 3h after the window, dock 4 queue. marked late
Wed 08:10  Carrier desk: charged Carrier 3 the late pickup fee on 7731
Wed 08:11  Ops day desk: 👍
Wed 14:00  Dev: tracking page is fine after the deploy, the map tiles were cached
Wed 16:20  Ops day desk: 7731 delivered 40 min before the appointment. driver made it up on the road
Wed 16:22  Carrier desk: nice
Thu 08:50  Ops day desk: dock 4 scanner fixed 🎉
Thu 08:51  Carrier desk: +1
Thu 09:30  Billing: issued Customer D a service credit for 7731, it's on this week's late report
Thu 09:31  Account team: wait, wasn't 7731 on time for them?
Thu 09:40  Billing: the report says late
Thu 09:41  Dev: report = pickup, see Monday
Thu 09:45  Ops night desk: heads up, 7802 will be late, ETA is already past the appointment. marking it late now so nobody promises otherwise
Thu 09:47  Ops day desk: it hasn't even been picked up
Thu 11:00  Account team: taking this to Friday's service review. I need one number before Customer D's Q3 on-time % goes out
Thu 11:02  Billing: does the credit on 7731 stand until then?
Thu 11:03  Carrier desk: following`;
