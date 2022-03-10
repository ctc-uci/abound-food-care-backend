CREATE TABLE IF NOT EXISTS public.event
(
    event_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    ntype character varying COLLATE pg_catalog."default",
    location character varying COLLATE pg_catalog."default" NOT NULL,
    start_datetime timestamp with time zone NOT NULL,
    end_datetime timestamp with time zone NOT NULL,
    volunteer_type character varying COLLATE pg_catalog."default",
    volunteer_requirements text COLLATE pg_catalog."default",
    volunteer_capacity integer NOT NULL,
    file_attachments character varying COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    CONSTRAINT event_pkey PRIMARY KEY (event_id)
);

CREATE TABLE IF NOT EXISTS public.postevent
(
    event_id integer,
    postevent_id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    description text COLLATE pg_catalog."default",
    CONSTRAINT postevent_pkey PRIMARY KEY (postevent_id),
    CONSTRAINT event_id FOREIGN KEY (event_id)
        REFERENCES public.event (event_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.volunteer_at_events
(
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    notes character varying COLLATE pg_catalog."default",
    CONSTRAINT event_id FOREIGN KEY (event_id)
        REFERENCES public.event (event_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.volunteer_at_events
(
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    notes character varying COLLATE pg_catalog."default",
    CONSTRAINT event_id FOREIGN KEY (event_id)
        REFERENCES public.event (event_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
