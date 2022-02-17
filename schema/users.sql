CREATE TABLE IF NOT EXISTS public.users
(
    birthdate date NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    phone text COLLATE pg_catalog."default" NOT NULL,
    preferred_contact_method character varying COLLATE pg_catalog."default",
    city character varying COLLATE pg_catalog."default" NOT NULL,
    physical_address character varying COLLATE pg_catalog."default" NOT NULL,
    weight_lifting_ability integer,
    criminal_history boolean NOT NULL,
    dui_history boolean NOT NULL,
    criminal_history_details text COLLATE pg_catalog."default",
    dui_history_details text COLLATE pg_catalog."default" NOT NULL,
    completed_chowmatch_training boolean NOT NULL,
    food_runs_interest boolean,
    specializations character varying COLLATE pg_catalog."default",
    volunteering_roles_interest text COLLATE pg_catalog."default",
    additional_information text COLLATE pg_catalog."default",
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    name character varying COLLATE pg_catalog."default" NOT NULL,
    u_type user_type NOT NULL,
    can_drive boolean,
    CONSTRAINT user_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.availability
(
    user_id integer,
    day_of_week day_of_week,
    start_time time with time zone,
    end_time time with time zone,
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.driver
(
    user_id integer NOT NULL,
    distance integer,
    vehicle_type character varying COLLATE pg_catalog."default",
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.language
(
    user_id integer NOT NULL,
    language character(1)[] COLLATE pg_catalog."default",
    proficiency integer,
    CONSTRAINT user_id FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

